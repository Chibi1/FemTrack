const express = require('express');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/reqRole');
const Cycle = require('../models/Cycle');       
const User = require('../models/User');         
const Symptom = require('../models/Symptom');
const { generateAlerts } = require('../utils/alertRules'); // Funkcja generująca alerty zdrowotne

const router = express.Router();

/**
 * Dodanie nowego cyklu menstruacyjnego.
 * Obliczamy datę zakończenia okresu i przewidywaną datę owulacji.
 */
router.post('/start', authenticate, requireRole('user'), async (req, res) => {
  const { startDate } = req.body;

  if (!startDate) {
    return res.status(400).json({ error: 'Brak daty rozpoczęcia okresu' });
  }

  try {
    const start = new Date(startDate);

    // Pobierz dane profilu użytkowniczki
    const user = await User.findById(req.user.userId);

    // Średnia długość cyklu i krwawienia (z profilu lub domyślna)
    const averageLength = user?.cycleLength || 28; 
    const periodLength = user?.periodLength || 5; 

    // Wyszukaj ostatni cykl przed nowym startem (jeśli istnieje)
    const lastCycle = await Cycle.findOne({
      userId: req.user.userId,
      startDate: { $lt: start } // tylko wcześniejsze cykle
    }).sort({ startDate: -1 }); // weź najnowszy z wcześniejszych 
    
    // Oblicz długość cyklu na podstawie różnicy między nowym a ostatnim cyklem
    if (lastCycle) {
      const previousStart = new Date(lastCycle.startDate);
      const currentStart = new Date(start);
      const diffMs = currentStart.getTime() - previousStart.getTime();
      const length = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // Zaktualizuj długość poprzedniego cyklu
      await Cycle.updateOne(
        { _id: lastCycle._id },
        { $set: { cycleLength: length } }
      );
    }

    // Obliczenie daty zakończenia okresu
    const end = new Date(start);
    end.setDate(end.getDate() + periodLength - 1);

    // Przewidywana owulacja: 14 dni przed końcem średniej długości cyklu
    const ovulation = new Date(start);
    ovulation.setDate(start.getDate() + (averageLength - 14));

    // Utwórz nowy cykl
    const newCycle = new Cycle({
      userId: req.user.userId,           
      startDate: start,
      endDate: end,
      averageLength,
      periodLength,
      ovulationDate: ovulation,
      ovulationType: 'predicted'        // Domyślnie owulacja jest przewidywana
    });

    await newCycle.save();
    const alerts = await generateAlerts(req.user.userId);
    res.status(201).json({ message: 'Cykl zapisany', cycle: newCycle, alerts });    
  } catch (err) {
    res.status(500).json({ error: 'Błąd zapisu cyklu' });
  }
});

/**
 * Pobranie wszystkich cykli użytkowniczki.
 * Dla każdego sprawdzamy, czy można potwierdzić owulację
 * (na podstawie daty rozpoczęcia kolejnego cyklu).
 */
router.get('/', authenticate, requireRole('user'), async (req, res) => {
  try {
    const cycles = await Cycle.find({ userId: req.user.userId }).sort({ startDate: 1 });

    const processedCycles = await Promise.all(
      cycles.map(async (cycle, index) => {
        let { ovulationDate, ovulationType } = cycle;
        let calculatedCycleLength = null;

        // Oblicz długość całego cyklu (o ile istnieje następny cykl)
        if (index + 1 < cycles.length) {
          const nextStart = new Date(cycles[index + 1].startDate);
          const currentStart = new Date(cycle.startDate);
          const diffMs = nextStart - currentStart;
          calculatedCycleLength = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // w dniach
        }

        // Potwierdzanie owulacji
        if (index + 1 < cycles.length) {
          const nextStart = new Date(cycles[index + 1].startDate);
          const confirmedOvulation = new Date(nextStart.getTime() - 14 * 24 * 60 * 60 * 1000);

          const isDifferent =
            ovulationType !== 'confirmed' ||
            new Date(ovulationDate).toDateString() !== confirmedOvulation.toDateString();

          if (isDifferent) {
            ovulationDate = confirmedOvulation;
            ovulationType = 'confirmed';

            await Cycle.updateOne(
              { _id: cycle._id },
              { $set: { ovulationDate, ovulationType } }
            );
          }
        }

        return {
          ...cycle.toObject(),
          ovulationDate,
          ovulationType,
          cycleLength: cycle.cycleLength || calculatedCycleLength // użyj istniejącego albo wylicz
        };
      })
    );

    res.json(processedCycles);
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas pobierania cykli' });
  }
});


/**
 * Edycja daty zakończenia okresu w konkretnym cyklu.
 * Na podstawie nowej daty wyliczamy aktualną długość okresu.
 */
router.put('/:id', authenticate, requireRole('user'), async (req, res) => {
  const { endDate } = req.body;

  if (!endDate) {
    return res.status(400).json({ error: 'Brak daty zakończenia okresu' });
  }

  try {
    // Zamiana daty w formacie 'YYYY-MM-DD' na obiekt Date (UTC)
    const [y, m, d] = endDate.split('-').map(Number);
    const normalizedEnd = new Date(Date.UTC(y, m - 1, d));

    const currentCycle = await Cycle.findById(req.params.id);
    if (!currentCycle) {
      return res.status(404).json({ error: 'Nie znaleziono cyklu' });
    }

    // Obliczamy liczbę dni trwania okresu (+1, bo uwzględniamy pierwszy dzień)
    const diffMs = normalizedEnd.getTime() - currentCycle.startDate.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    const oldEnd = new Date(currentCycle.endDate);
    const oldPeriodDates = [];
    const old = new Date(currentCycle.startDate);
    while (old <= oldEnd) {
      oldPeriodDates.push(old.toISOString().split('T')[0]);
      old.setDate(old.getDate() + 1);
    }

    const newPeriodDates = [];
    const now = new Date(currentCycle.startDate);
    while (now <= normalizedEnd) {
      newPeriodDates.push(now.toISOString().split('T')[0]);
      now.setDate(now.getDate() + 1);
    }

    const removedDates = oldPeriodDates.filter(d => !newPeriodDates.includes(d));

    await Promise.all(removedDates.map(async (dateString) => {
      const date = new Date(dateString);
      await Symptom.updateOne(
        { userId: req.user.userId, date },
        {
          $set: {
            isPeriodDay: false,
            bleedingIntensity: null,
            abdominalPainLevel: null
          }
        }
      );
    }));

    const update = {
      endDate: normalizedEnd,
      periodLength: days
    };

    const updatedCycle = await Cycle.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      update,
      { new: true }
    );

    const alerts = await generateAlerts(req.user.userId);
    res.json({ message: 'Cykl zaktualizowany', cycle: updatedCycle, alerts });    
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas edytowania cyklu' });
  }
});

/**
 * Usunięcie cyklu menstruacyjnego użytkowniczki.
 * Jeśli usuwany cykl był wykorzystywany do potwierdzenia owulacji w poprzednim cyklu,
 * owulacja zostaje cofnięta do przewidywanej (na podstawie średniej długości cyklu).
 */
router.delete('/:id', authenticate, requireRole('user'), async (req, res) => {
  try {
    // Usuwamy cykl tylko jeśli należy do zalogowanej użytkowniczki
    const deleted = await Cycle.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Nie znaleziono cyklu' });
    }

    // Usuwanie danych okresowych z symptomów przypisanych do usuwanego okresu
    const start = new Date(deleted.startDate);
    const end = new Date(deleted.endDate);

    const datesToClear = [];
    const current = new Date(start);
    while (current <= end) {
      datesToClear.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    await Promise.all(datesToClear.map(async (date) => {
      await Symptom.updateOne(
        { userId: req.user.userId, date },
        {
          $set: {
            isPeriodDay: false,
            bleedingIntensity: null,
            abdominalPainLevel: null
          }
        }
      );
    }));

    // Sprawdzamy, czy istnieje poprzedni cykl 
    const previousCycle = await Cycle.findOne({
      userId: req.user.userId,
      startDate: { $lt: deleted.startDate }
    }).sort({ startDate: -1 });

    if (previousCycle) {
      // Usunięcie kolejnego cyklu uniemożliwia potwierdzenie owulacji w poprzednim cyklu,
      // więc przywracamy owulację przewidywaną
      const predictedOvulation = new Date(previousCycle.startDate);
      predictedOvulation.setDate(
        predictedOvulation.getDate() + (previousCycle.averageLength - 14)
      );

      await Cycle.updateOne(
        { _id: previousCycle._id },
        {
          $set: {
            ovulationDate: predictedOvulation,
            ovulationType: 'predicted'
          }
        }
      );
    }

    const alerts = await generateAlerts(req.user.userId);
    res.json({ message: 'Cykl usunięty pomyślnie', alerts });
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas usuwania cyklu' });
  }
});



module.exports = router;