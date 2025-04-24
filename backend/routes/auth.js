const express = require('express');
const bcrypt = require('bcryptjs');           // Haszowanie haseł
const jwt = require('jsonwebtoken');          // Tworzenie i weryfikacja tokenów JWT
const User = require('../models/User');       // Model użytkownika
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/reqRole');

const router = express.Router();

/**
 * Rejestracja nowego użytkownika (użytkowniczki lub lekarza).
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Walidacja pól wejściowych
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Wszystkie pola są wymagane.' });
  }

  // Minimalna długość hasła
  if (password.length < 6) {
    return res.status(400).json({ error: 'Hasło musi mieć co najmniej 6 znaków.' });
  }

  // Sprawdzenie, czy e-mail już istnieje w bazie
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: 'Użytkownik z tym adresem e-mail już istnieje.' });
  }

  try {
    // Haszowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tworzenie użytkownika z haszowanym hasłem
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    // Sukces rejestracji
    res.status(201).json({ message: 'Użytkownik zarejestrowany pomyślnie.' });
  } catch (err) {
    // Błąd serwera
    res.status(500).json({ error: 'Wystąpił błąd podczas rejestracji.', details: err });
  }
});

/**
 * Logowanie użytkownika.
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Szukanie użytkownika po e-mailu
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'Nie znaleziono konta z takim adresem email.' });
  }

  // Weryfikacja hasła (porównanie z haszem)
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Nieprawidłowe hasło.' });
  }

  // Tworzenie tokenu JWT (zawiera id i rolę użytkownika)
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Odpowiedź z tokenem i rolą użytkownika (do użycia w frontendzie)
  res.send({ token, role: user.role });
});

router.delete('/delete-self', authenticate, requireRole('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Nie znaleziono użytkowniczki' });
    }

    await user.deleteOne(); 

    res.json({ message: 'Użytkowniczka i jej dane zostały usunięte' });
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas usuwania konta' });
  }
});

module.exports = router;
