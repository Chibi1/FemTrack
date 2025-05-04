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
    required: true
  },
  // Długość danego cyklu
  cycleLength: {
    type: Number,
    default: null
  },
  // Liczba dni krwawienia
  periodLength: {
    type: Number,
    required: true
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

module.exports = mongoose.model('Cycle', cycleSchema);
