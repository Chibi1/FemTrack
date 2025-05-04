const multer = require('multer');
const path = require('path');

// Konfiguracja miejsca i nazwy zapisywanego pliku
const storage = multer.diskStorage({
  // Gdzie zapisywać pliki (katalog 'uploads/')
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  // Jak nazywać pliki – unikalna nazwa: ID użytkowniczki + timestamp + rozszerzenie
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${req.user.userId}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// Konfiguracja uploadu
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit wielkości pliku: 2 MB
  fileFilter(req, file, cb) {
    // Akceptuj tylko pliki typu obraz
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Plik musi być obrazem'));
    }
    cb(null, true);
  },
});

module.exports = upload;
