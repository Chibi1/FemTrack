const express = require('express');
const router = express.Router();

const requireAuth = require('../middleware/authenticate');     
const upload = require('../middleware/upload');               
const User = require('../models/User');                        
const { getProfile, updateProfile } = require('../controllers/profileController'); 

// POST /api/profile/upload-avatar – zapisuje przesłane zdjęcie profilowe
router.post(
  '/upload-avatar',
  requireAuth,
  upload.single('profileImage'), // Obsługa jednego pliku o nazwie 'profileImage'
  async (req, res) => {
    try {
      // Aktualizacja pola profileImage (nazwa pliku) w bazie danych
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { profileImage: req.file.filename },
        { new: true } // zwraca zaktualizowany dokument
      );

      // Zwróć tylko nazwę zapisanego pliku
      res.json({ profileImage: user.profileImage });
    } catch (err) {
      res.status(500).json({ error: 'Błąd zapisu zdjęcia' });
    }
  }
);

// GET /api/profile – pobiera dane profilu użytkowniczki
router.get('/', requireAuth, getProfile);

// PUT /api/profile – aktualizuje dane profilu użytkowniczki
router.put('/', requireAuth, updateProfile);

module.exports = router;
