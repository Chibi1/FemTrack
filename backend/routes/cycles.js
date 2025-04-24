const express = require('express');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/reqRole');
const Cycle = require('../models/Cycle');       // Model cyklu

const router = express.Router();

/**
 * Dodanie nowego cyklu menstruacyjnego.
 * Obliczamy datę zakończenia okresu i przewidywaną datę owulacji.
 */
router.post('/start', authenticate, requireRole('user'), async (req, res) => {
  const { startDate, averageLength=28, periodLength=5 } = req.body;

  if (!startDate) {
    return res.status(400).json({ error: 'Brak daty rozpoczęcia okresu' });
  }

  try {
    const start = new Date(startDate);

    // Obliczenie długości poprzedniego cyklu (jeśli istnieje)
    const lastCycle = await Cycle.findOne({ userId: req.user.userId }).sort({ startDate: -1 });

    if (lastCycle) {
      const previousStart = new Date(lastCycle.startDate);
      const currentStart = new Date(start);
      const diffMs = currentStart.getTime() - previousStart.getTime();
      const length = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      await Cycle.updateOne(
        { _id: lastCycle._id },
        { $set: { cycleLength: length } }
      );
    }

    // Obliczenie daty zakończenia okresu
    const end = new Date(start);
    end.setDate(end.getDate() + periodLength - 1);

    // Przewidywana owulacja: 14 dni przed końcem średniego (28-dniowego) cyklu
    const ovulation = new Date(start);
    ovulation.setDate(start.getDate() + (averageLength - 14));

    const newCycle = new Cycle({
      userId: req.user.userId,           // Identyfikator zalogowanej użytkowniczki
      startDate: start,
      endDate: end,
      averageLength,
      periodLength,
      ovulationDate: ovulation,
      ovulationType: 'predicted'        // Domyślnie owulacja jest przewidywana
    });

    await newCycle.save();
    res.status(201).json({ message: 'Cykl zapisany', cycle: newCycle });
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

        // Jeśli jest dostępny kolejny cykl – możemy potwierdzić owulację
        if (index + 1 < cycles.length) {
          const nextStart = new Date(cycles[index + 1].startDate);

          // Owulacja przypada 14 dni przed rozpoczęciem kolejnego cyklu
          const confirmedOvulation = new Date(nextStart.getTime() - 14 * 24 * 60 * 60 * 1000);

          const isDifferent =
            ovulationType !== 'confirmed' ||
            new Date(ovulationDate).toDateString() !== confirmedOvulation.toDateString();

          // Jeśli dane się różnią – aktualizujemy owulację w bazie
          if (isDifferent) {
            ovulationDate = confirmedOvulation;
            ovulationType = 'confirmed';

            await Cycle.updateOne(
              { _id: cycle._id },
              { $set: { ovulationDate, ovulationType } }
            );
          }
        }

        // Zwracamy cykl z aktualną datą owulacji
        return {
          ...cycle.toObject(),
          ovulationDate,
          ovulationType
        };
      })
    );

    res.json(processedCycles);
  } catch (err) {
    console.error('Błąd przy pobieraniu cykli:', err);
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

    const update = {
      endDate: normalizedEnd,
      periodLength: days
    };

    const updatedCycle = await Cycle.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      update,
      { new: true }
    );

    res.json({ message: 'Cykl zaktualizowany', cycle: updatedCycle });
  } catch (err) {
    console.error('Błąd PUT /cycles/:id', err);
    res.status(500).json({ error: 'Błąd podczas edytowania cyklu' });
  }
});

/**
 * Usunięcie cyklu z bazy danych.
 * Możliwe tylko dla właścicielki cyklu.
 */
router.delete('/:id', authenticate, requireRole('user'), async (req, res) => {
  try {
    const deleted = await Cycle.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Nie znaleziono cyklu' });
    }

    // Aktualizacja owulacji w poprzednim cyklu, jeśli istniał
    const previousCycle = await Cycle.findOne({
      userId: req.user.userId,
      startDate: { $lt: deleted.startDate }
    }).sort({ startDate: -1 });

    if (previousCycle) {
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

    res.json({ message: 'Cykl usunięty pomyślnie' });
  } catch (err) {
    console.error('Błąd podczas usuwania cyklu:', err);
    res.status(500).json({ error: 'Błąd podczas usuwania cyklu' });
  }
});


module.exports = router;
