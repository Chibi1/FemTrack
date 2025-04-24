const mongoose = require('mongoose');

/**
 * Model cyklu menstruacyjnego przypisanego do użytkowniczki.
 */
const cycleSchema = new mongoose.Schema({
  // Id użytkowniczki
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Początek okresu
  startDate: {
    type: Date,
    required: true
  },
  // Koniec okresu
  endDate: {
    type: Date,
    required: true
  },
  // Średnia długość cyklu
  averageLength: {
    type: Number,
    default: 28
  },
  // Długość danego cyklu
  cycleLength: {
    type: Number,
    default: null
  },
  // Liczba dni krwawienia
  periodLength: {
    type: Number,
    default: 5
  },
  // Data owulacji (przewidywana lub potwierdzona)
  ovulationDate: {
    type: Date,
    default: null
  },
  // Typ owulacji
  ovulationType: {
    type: String,
    enum: ['predicted', 'confirmed'],
    default: 'predicted'
  }
});

// Eksport modelu do użycia w aplikacji
module.exports = mongoose.model('Cycle', cycleSchema);
