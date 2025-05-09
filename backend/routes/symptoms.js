const express = require('express');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/reqRole');
const Symptom = require('../models/Symptom');
const { generateAlerts } = require('../utils/alertRules'); 

const router = express.Router();

// Regex do sprawdzenia poprawnego formatu daty
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Pomocnicza funkcja do przekształcenia daty tekstowej na datę w formacie UTC.
 * 'YYYY-MM-DD' -> Date.UTC
 */
const parseDate = (dateString) => {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/**
 * Pobranie symptomów dla konkretnego dnia użytkowniczki.
 * GET /api/symptoms/:date
 */
router.get('/:date', authenticate, requireRole('user'), async (req, res) => {
  const { date } = req.params;

  // Walidacja formatu daty
  if (!DATE_REGEX.test(date)) {
    return res.status(400).json({ error: 'Nieprawidłowy format daty' });
  }

  try {
    const symptom = await Symptom.findOne({
      userId: req.user.userId,
      date: parseDate(date),
    });

    if (!symptom) {
      return res.status(404).json({ message: 'Brak zapisanych symptomów na ten dzień' });
    }

    res.json(symptom);
  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera przy pobieraniu danych' });
  }
});

/**
 * Zapis lub aktualizacja symptomów dla danego dnia.
 * POST /api/symptoms/:date
 * Jeśli wpis istnieje — jest aktualizowany, jeśli nie — tworzony nowy.
 */
router.post('/:date', authenticate, requireRole('user'), async (req, res) => {
  const { date } = req.params;

  // Walidacja formatu daty
  if (!DATE_REGEX.test(date)) {
    return res.status(400).json({ error: 'Nieprawidłowy format daty' });
  }

  // Dane objawów przekazane z formularza
  const {
    mood = [],
    symptoms = [],
    abdominalPainLevel = null,
    bleedingIntensity = null,
    isPeriodDay = false,
    notes = '',
  } = req.body;

  const parsedDate = parseDate(date);

  try {
    // Sprawdzenie, czy już istnieje wpis dla danego dnia
    const existing = await Symptom.findOne({
      userId: req.user.userId,
      date: parsedDate,
    });

    const data = {
      userId: req.user.userId,
      date: parsedDate,
      mood,
      symptoms,
      abdominalPainLevel,
      bleedingIntensity,
      isPeriodDay,
      notes,
    };

    // Aktualizacja istniejącego wpisu
    if (existing) {
      await Symptom.updateOne({ _id: existing._id }, { $set: data });
      const alerts = await generateAlerts(req.user.userId);
      return res.json({ message: 'Symptomy zaktualizowane', alerts });      
    }

    // Utworzenie nowego wpisu
    const newSymptom = new Symptom(data);
    await newSymptom.save();
    const alerts = await generateAlerts(req.user.userId);
    res.status(201).json({ message: 'Symptomy zapisane', alerts });    
  } catch (err) {
    console.error('Błąd zapisu symptomów:', err);
    res.status(500).json({ error: 'Uzupełnij w formularzu obfitość krwawienia' });
  }
});

/**
 * Edycja istniejącego wpisu symptomów.
 * PUT /api/symptoms/:date
 * Aktualizuje całość danych na dany dzień.
 */
router.put('/:date', authenticate, requireRole('user'), async (req, res) => {
  const { date } = req.params;

  // Walidacja formatu daty
  if (!DATE_REGEX.test(date)) {
    return res.status(400).json({ error: 'Nieprawidłowy format daty' });
  }

  const userId = req.user.userId;

  try {
    const updated = await Symptom.findOneAndUpdate(
      { userId, date: parseDate(date) },
      { ...req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Nie znaleziono wpisu do aktualizacji' });
    }

    const alerts = await generateAlerts(req.user.userId);
    res.json({ symptom: updated, alerts });    
  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

/**
 * Pobranie wszystkich dat, w których zapisano objawy.
 * GET /api/symptoms
 * Używane do oznaczania dni z zapisanymi symptomami w kalendarzu.
 */
router.get('/', authenticate, requireRole('user'), async (req, res) => {
  try {
    const symptoms = await Symptom.find({ userId: req.user.userId });

    // Zamiana daty do formatu YYYY-MM-DD
    const dates = symptoms.map(s =>
      new Date(s.date).toISOString().split('T')[0]
    );

    res.json(dates);
  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera przy pobieraniu dat' });
  }
});

/**
 * Usunięcie symptomów dla danego dnia.
 * DELETE /api/symptoms/:date
 */
router.delete('/:date', authenticate, requireRole('user'), async (req, res) => {
  const { date } = req.params;

  // Walidacja formatu daty
  if (!DATE_REGEX.test(date)) {
    return res.status(400).json({ error: 'Nieprawidłowy format daty.' });
  }

  try {
    const deleted = await Symptom.deleteOne({
      userId: req.user.userId,
      date: parseDate(date),
    });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: 'Brak zapisanych symptomów na ten dzień' });
    }

    const alerts = await generateAlerts(req.user.userId);
    res.json({ message: 'Symptomy usunięte', alerts });
  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera przy usuwaniu danych' });
  }
});

module.exports = router;
