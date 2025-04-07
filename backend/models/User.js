const mongoose = require('mongoose');

/**
 * Model użytkownika aplikacji.
 * Może być to pacjentka (user) lub lekarz (doctor).
 */
const userSchema = new mongoose.Schema({
  // Imię 
  name: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  // Adres e-mail (unikalny, wymagany)
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  // Hasło (przechowywane w formie haszowanej)
  password: {
    type: String,
    required: true
  },
  // Rola w systemie: pacjentka lub lekarz
  role: {
    type: String,
    enum: ['user', 'doctor'],
    default: 'user'
  }
});

// Eksport modelu do użycia przy rejestracji i logowaniu
module.exports = mongoose.model('User', userSchema);
