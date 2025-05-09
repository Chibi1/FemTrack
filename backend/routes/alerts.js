const express = require('express');
const router = express.Router();
const { generateAlerts } = require('../utils/alertRules');

// GET /api/alerts – generuje i zwraca aktualne alerty zdrowotne użytkowniczki
router.get('/', async (req, res) => {
  try {
    const alerts = await generateAlerts(req.user.userId); // Wywołanie reguł alertów na podstawie danych użytkowniczki
    res.json(alerts); // Zwrócenie tablicy alertów w formacie JSON
  } catch (err) {
    res.status(500).json({ message: 'Błąd podczas pobierania alertów' });
  }
});

module.exports = router;
