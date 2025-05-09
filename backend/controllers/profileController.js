const User = require('../models/User');
const { generateAlerts } = require('../utils/alertRules');  // Funkcja generująca alerty zdrowotne

// GET /api/profile – pobiera dane profilu użytkowniczki (bez hasła i __v)
const getProfile = async (req, res) => {
  try {
    // Znajdź użytkowniczkę po ID
    const user = await User.findById(req.user.userId).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkowniczki' });

    // Uzupełnij brakujące pola domyślnymi wartościami, aby frontend miał kompletny obiekt
    const fullUser = {
      name: '',
      email: '',
      birthdate: '',
      height: '',
      weight: '',
      cycleLength: '',
      periodLength: '',
      hormonalContraception: false,
      contraceptionType: '',
      takesMeds: false,
      meds: '',
      hasChronicIllness: false,
      chronicIllness: '',
      lastGynecologistVisit: '',
      profileImage: '',
      ...user.toObject() // nadpisanie domyślnych wartości tymi z bazy, jeśli istnieją
    };

    // Zwróć uzupełniony obiekt profilu
    res.json(fullUser);
  } catch (err) {
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// PUT /api/profile – aktualizuje dane profilu użytkowniczki
const updateProfile = async (req, res) => {
  try {
    // Lista pól, które można edytować w profilu
    const allowedFields = [
      'name', 'email', 'birthdate', 'height', 'weight',
      'cycleLength', 'periodLength',
      'hormonalContraception', 'contraceptionType',
      'takesMeds', 'meds',
      'hasChronicIllness', 'chronicIllness',
      'lastGynecologistVisit',
      'profileImage'
    ];

    const updates = {};
    // Zbierz tylko te pola, które rzeczywiście zostały przesłane w żądaniu
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      req.body.currentPassword || 
      req.body.password || 
      req.body.confirmPassword
    ) {
      const bcrypt = require('bcrypt');
      const user = await User.findById(req.user.userId);
    
      // Sprawdzenie, czy użytkowniczka podała WSZYSTKIE 3 pola
      if (!req.body.currentPassword || !req.body.password || !req.body.confirmPassword) {
        return res.status(400).json({
          message: 'Aby zmienić hasło, podaj obecne hasło oraz dwukrotnie nowe hasło',
        });
      }
    
      // Sprawdzenie poprawności obecnego hasła
      const isCurrentCorrect = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isCurrentCorrect) {
        return res.status(400).json({ message: 'Obecne hasło jest nieprawidłowe' });
      }
    
      // Nowe hasła muszą się zgadzać
      if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: 'Nowe hasła nie są takie same' });
      }
    
      // Nowe hasło musi mieć min. 6 znaków
      if (req.body.password.length < 6) {
        return res.status(400).json({ message: 'Nowe hasło musi mieć co najmniej 6 znaków' });
      }
    
      // Nowe hasło nie może być takie jak poprzednie
      const isSame = await bcrypt.compare(req.body.password, user.password);
      if (isSame) {
        return res.status(400).json({ message: 'Nowe hasło musi różnić się od poprzedniego' });
      }
    
      // Wszystko OK – haszujemy i zapisujemy
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }
    // Zaktualizuj dane użytkowniczki i zwróć nowy obiekt
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkowniczki' });

    const alerts = await generateAlerts(req.user.userId);
    res.json({ user, alerts });
  } catch (err) {
    res.status(500).json({ message: 'Błąd podczas aktualizacji profilu' });
  }
};

module.exports = { getProfile, updateProfile };
