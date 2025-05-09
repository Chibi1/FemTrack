const Cycle = require('../models/Cycle');
const Symptom = require('../models/Symptom');
const User = require('../models/User');

/**
 * Wykrywa 3 dni z rzędu z bólem brzucha na poziomie ≥ 5
 */
function detectStrongAbdominalPain(symptoms) {
  const filtered = symptoms
    .filter(s => s.abdominalPainLevel >= 5)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  let streak = 1;
  for (let i = 1; i < filtered.length; i++) {
    const delta = (new Date(filtered[i].date) - new Date(filtered[i - 1].date)) / (1000 * 60 * 60 * 24);
    streak = delta === 1 ? streak + 1 : 1;
    if (streak === 3) return true;
  }
  return false;
}

/**
 * Wykrywa 4 dni z rzędu z obfitym krwawieniem
 */
function detectHeavyBleedingStreak(symptoms) {
  const filtered = symptoms
    .filter(s => s.bleedingIntensity === 'heavy')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  let streak = 1;
  for (let i = 1; i < filtered.length; i++) {
    const delta = (new Date(filtered[i].date) - new Date(filtered[i - 1].date)) / (1000 * 60 * 60 * 24);
    streak = delta === 1 ? streak + 1 : 1;
    if (streak === 4) return true;
  }
  return false;
}

/**
 * Sprawdza, czy cykl menstruacyjny jest opóźniony
 */
function checkDelayedPeriod(cycles, alerts) {
  const today = new Date();

  // Cykl aktywny (brak zakończenia)
  const activeCycle = cycles.find(c => c.cycleLength == null);

  if (activeCycle) {
    const start = new Date(activeCycle.startDate);
    const expected = activeCycle.averageLength || 28;
    const daysElapsed = Math.floor((today - start) / (1000 * 60 * 60 * 24));

    if (daysElapsed - expected > 3) {
      alerts.push({
        message: `Twój okres spóźnia się już ${daysElapsed - expected} dni.`
      });
    }
  } else {
    // Szukamy ostatniego zakończonego cyklu
    const finishedCycles = cycles
      .filter(c => c.cycleLength != null)
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    if (finishedCycles.length > 0) {
      const last = finishedCycles[0];
      const expected = last.averageLength || 28;
      const lastStart = new Date(last.startDate);
      const expectedNext = new Date(lastStart);
      expectedNext.setDate(expectedNext.getDate() + expected);

      const daysLate = Math.floor((today - expectedNext) / (1000 * 60 * 60 * 24));

      if (daysLate > 3) {
        alerts.push({
          message: `Twój okres spóźnia się już ${daysLate} dni.`
        });
      }
    }
  }
}


/**
 * Główna funkcja – generuje listę alertów zdrowotnych
 */
async function generateAlerts(userId) {
  const [cycles, symptoms, user] = await Promise.all([
    Cycle.find({ userId }).sort({ startDate: -1 }),
    Symptom.find({ userId }).sort({ date: 1 }),
    User.findById(userId)
  ]);

  const alerts = [];

  // 3 dni z rzędu z silnym bólem brzucha
  if (detectStrongAbdominalPain(symptoms)) {
    alerts.push({ message: 'Trzeci dzień z rzędu notujesz ból brzucha na poziomie powyżej 4.' });
  }

  // 4 dni z rzędu z obfitym krwawieniem
  if (detectHeavyBleedingStreak(symptoms)) {
    alerts.push({ message: 'Czwarty dzień z rzędu notujesz obfite krwawienie.' });
  }

  // Zbyt krótki lub zbyt długi cykl
  if (cycles.length >= 2) {
    const last = cycles[1]; 

    if (last.cycleLength < 20) {
      alerts.push({ message: `Twój ostatni cykl trwał tylko ${last.cycleLength} dni, co może być zbyt krótko.` });
    }
    if (last.cycleLength > 40) {
      alerts.push({ message: `Twój ostatni cykl trwał aż ${last.cycleLength} dni, co może być zbyt długo.` });
    }
  }

  // Zbyt krótki lub zbyt długi okres
  if (cycles.length >= 1) {
    const current = cycles[0]; 
  
    if (current.periodLength < 4) {
      alerts.push({ message: `Twój obecny okres trwa tylko ${current.periodLength} dni.` });
    }
    if (current.periodLength > 8) {
      alerts.push({ message: `Twój obecny okres trwa już ${current.periodLength} dni.` });
    }
  }

  // Spóźniony okres
  checkDelayedPeriod(cycles, alerts);

  // 5 dni z rzędu bez zaznaczenia "Wszystko OK"
  const notOkDays = symptoms
    .filter(s => !(s.symptoms || []).includes('wszystko OK'))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  let streak = 1;
  for (let i = 1; i < notOkDays.length; i++) {
    const delta = (new Date(notOkDays[i].date) - new Date(notOkDays[i - 1].date)) / (1000 * 60 * 60 * 24);
    streak = delta === 1 ? streak + 1 : 1;
    if (streak === 5) {
      alerts.push({ message: 'Piąty dzień z rzędu nie zaznaczyłaś „Wszystko OK”.' });
      break;
    }
  }

  // Wizyta u ginekologa ponad rok temu
  if (user.lastGynecologistVisit) {
    const daysSinceVisit = Math.floor((new Date() - new Date(user.lastGynecologistVisit)) / (1000 * 60 * 60 * 24));
    if (daysSinceVisit > 365) {
      alerts.push({ message: 'Twoja ostatnia wizyta u ginekologa była ponad rok temu. Warto umówić się na kontrolę.' });
    }
  }

  // Nieregularne cykle – co najmniej 3 różnice > 7 dni w ostatnich 6 cyklach
  if (cycles.length >= 6) {
    const recent = cycles.slice(0, 6).reverse().map(c => new Date(c.startDate));
    const diffs = [];
    for (let i = 1; i < recent.length; i++) {
      diffs.push(Math.floor((recent[i] - recent[i - 1]) / (1000 * 60 * 60 * 24)));
    }

    let irregularCount = 0;
    for (let i = 1; i < diffs.length; i++) {
      if (Math.abs(diffs[i] - diffs[i - 1]) > 7) irregularCount++;
    }

    if (irregularCount >= 3) {
      alerts.push({ message: 'Twoje ostatnie 6 cykli wydają się nieregularne.' });
    }
  }

  return alerts;
}

module.exports = { generateAlerts };
