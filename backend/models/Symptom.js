const mongoose = require('mongoose');

/**
 * Model objawów przypisanych do konkretnego dnia cyklu użytkowniczki.
 */
const symptomSchema = new mongoose.Schema({
  // Id użytkowniczki
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Data, której dotyczą objawy
  date: {
    type: Date,
    required: true,
  },

  // Czy dany dzień należy do okresu
  isPeriodDay: {
    type: Boolean,
    required: true,
  },

  // Nastroje odnotowane w danym dniu (wielokrotny wybór)
  mood: [String],

  // Objawy ogólne w danym dniu (wielokrotny wybór)
  symptoms: [String],

  // Poziom bólu brzucha (tylko dla dni okresowych, skala 0–7)
  abdominalPainLevel: {
    type: Number,
    min: 0,
    max: 7,
  },

  // Intensywność krwawienia (tylko dla dni okresowych)
  bleedingIntensity: {
    type: String,
    enum: ['light', 'medium', 'heavy'],
  }

}, {
  timestamps: true
});

// Każdy użytkownik może dodać tylko jeden zestaw objawów na dany dzień
symptomSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Symptom', symptomSchema);
