const mongoose = require('mongoose');
const Cycle = require('./Cycle');
const Symptom = require('./Symptom');

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
  },

  // DANE PROFILU (opcjonalne, uzupełniane przez użytkowniczkę):
  birthdate: Date,
  height: Number, 
  weight: Number, 
  cycleLength: Number,
  periodLength: Number,
  hormonalContraception: Boolean,
  contraceptionType: String,
  takesMeds: Boolean,
  meds: String,
  hasChronicIllness: Boolean,
  chronicIllness: String,
  lastGynecologistVisit: Date,
  profileImage: String 
});

/**
 * Usuwanie powiązanych danych (cykle i objawy) po usunięciu użytkownika.
 */
userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    const userId = this._id;

    await Promise.all([
      Cycle.deleteMany({ userId }),
      Symptom.deleteMany({ userId })
    ]);

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
