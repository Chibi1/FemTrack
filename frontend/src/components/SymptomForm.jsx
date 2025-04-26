import React, { useState, useEffect } from 'react';
import './SymptomForm.css'; 

// Opcje nastroju dostępne do zaznaczenia
const moodOptions = [
  'pełnia energii', 'spokój', 'szczęście', 'zagubienie',
  'wahania nastroju', 'smutek', 'poirytowanie', 'obsesyjne myśli', 
  'przygnębienie', 'brak energii', 
];

// Opcje objawów fizycznych dostępne do zaznaczenia
const symptomsOptions = [
  'wszystko OK', 'ból głowy', 'ból pleców', 'ból brzucha',
  'skurcze', 'plamienia', 'tkliwe piersi', 'trądzik',
  'zmęczenie', 'bezsenność', 'zachcianki', 'mdłości',
  'zaparcia', 'wzdęcia', 'biegunka'
];

// Opcje obfitości krwawienia podczas okresu
const bleedingOptions = [
  { value: 'light', label: 'Skąpe' },
  { value: 'medium', label: 'Średnie' },
  { value: 'heavy', label: 'Obfite' }
];

/**
 * Komponent formularza do zapisywania lub edycji symptomów użytkowniczki.
 */
function SymptomForm({ date, isPeriodDay, existingData, onSubmit, onClose }) {

  const [mood, setMood] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [abdominalPainLevel, setAbdominalPainLevel] = useState(0);
  const [bleedingIntensity, setBleedingIntensity] = useState('');
  const [notes, setNotes] = useState('');

  /**
   * Inicjalizacja stanu formularza na podstawie istniejących danych symptomów.
   */
  useEffect(() => {
    if (existingData) {
      setMood(existingData.mood || []);
      setSymptoms(existingData.symptoms || []);
      setAbdominalPainLevel(existingData.abdominalPainLevel || 0);
      setBleedingIntensity(existingData.bleedingIntensity || '');
      setNotes(existingData.notes || '');
    } else {
      setMood([]);
      setSymptoms([]);
      setAbdominalPainLevel(0);
      setBleedingIntensity('');
    }
  }, [existingData]);
  
  /**
   * Blokowanie submitu formularza klawiszem Enter w modalu.
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    };
  
    const modal = document.querySelector('.symptom-modal');
    modal?.addEventListener('keydown', handleKeyDown);
  
    return () => modal?.removeEventListener('keydown', handleKeyDown);
  }, []);  
  
  /**
   * Obsługa zmiany zaznaczenia checkboxów (nastroje, objawy).
   */
  const handleCheckboxChange = (option, state, setState) => {
    if (state.includes(option)) {
      setState(state.filter(item => item !== option));
    } else {
      setState([...state, option]);
    }
  };

  /**
   * Funkcja pomocnicza — sprawdzenie, czy dwie tablice są identyczne.
   */
  const isEqualArray = (arr1, arr2) => {
    const a = [...arr1].sort();
    const b = [...arr2].sort();
    return a.length === b.length && a.every((val, i) => val === b[i]);
  };

  /**
   * Sprawdzenie, czy formularz został zmodyfikowany względem istniejących danych.
   */
  const isModified = () => {
    if (!existingData) return true;
  
    const sameMood = isEqualArray(mood, existingData.mood || []);
    const sameSymptoms = isEqualArray(symptoms, existingData.symptoms || []);
    const samePain = abdominalPainLevel === (existingData.abdominalPainLevel ?? 0);
    const sameBleeding = bleedingIntensity === (existingData.bleedingIntensity ?? '');
  
    return !(sameMood && sameSymptoms && samePain && sameBleeding);
  };
  
  /**
   * Obsługa wysyłki formularza (zapis lub aktualizacja symptomów).
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      mood,
      symptoms,
      isPeriodDay,
      notes,
      ...(isPeriodDay && {
        abdominalPainLevel,
        bleedingIntensity
      })
    };
  
    try {
      const token = localStorage.getItem('token');
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const method = existingData ? 'PUT' : 'POST';
  
      const res = await fetch(`/api/symptoms/${formattedDate}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Wystąpił błąd');
      }
  
      const data = await res.json();
      console.log('Symptomy zapisane:', data);
  
      onSubmit(data); // Aktualizacja danych w panelu użytkowniczki
      onClose();      // Zamknięcie formularza
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  /**
   * Obsługa usunięcia zapisanych symptomów dla danego dnia.
   */
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
      const res = await fetch(`/api/symptoms/${formattedDate}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Nie udało się usunąć objawów.');
      }
  
      onSubmit(null); // Informacja dla UserPanel, że objawy zostały usunięte 
      onClose();
    } catch (err) {
      console.error("Błąd przy usuwaniu symptomów:", err);
      alert("Wystąpił błąd przy usuwaniu objawów.");
    }
  };
  
  // Czy formularz może być wysłany 
  const canSubmit = mood.length > 0 || symptoms.length > 0 || isPeriodDay;

  /**
   * Widok formularza w modalu.
   */
  return (
    <div className="symptom-modal-overlay">
      <div className="symptom-modal">
        <button className="close-modal-button" onClick={onClose}>×</button>
        <h3>
            {isPeriodDay ? 'Zanotuj swoje objawy podczas krwawienia' : 'Zanotuj swoje objawy'} —{' '}
            {date.toLocaleDateString('pl-PL')}
        </h3>
        <form onSubmit={handleSubmit}>
          <fieldset>
            {/* Nastrój */}
            <h4>Nastrój</h4>
            <div className="option-group">
              {moodOptions.map(option => (
                <label key={option}>
                  <input
                    type="checkbox"
                    value={option}
                    checked={mood.includes(option)}
                    onChange={() => handleCheckboxChange(option, mood, setMood)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            {/* Objawy */}
            <h4>Objawy</h4>
            <div className="option-group">
              {symptomsOptions.map(option => (
                <label key={option}>
                  <input
                    type="checkbox"
                    value={option}
                    checked={symptoms.includes(option)}
                    onChange={() => handleCheckboxChange(option, symptoms, setSymptoms)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
  
            {/* Dodatkowe pola dla dni okresu */}
            {isPeriodDay && (
              <div className="pain-bleeding-wrapper">
                <div className="pain-level-section">
                  <label htmlFor="painLevel">Poziom bólu brzucha (0-7)</label>
                  <input
                    id="painLevel"
                    type="number"
                    min="0"
                    max="7"
                    value={abdominalPainLevel}
                    onChange={(e) => setAbdominalPainLevel(Number(e.target.value))}
                  />
                </div>

                <div className="bleeding-section">
                  <label htmlFor="bleedingAmount">Obfitość krwawienia</label>
                  <select
                    id="bleedingAmount"
                    value={bleedingIntensity}
                    onChange={(e) => setBleedingIntensity(e.target.value)}
                  >
                    <option value="">Wybierz</option>
                    {bleedingOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Własne notatki */}
            <div className="notes-section">
              <label htmlFor="notes">Własne notatki</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Np. szczegóły bólu, nietypowe objawy..."
              />
            </div>

            {/* Przycisk zapisu i opcjonalnie przycisk usuwania */}
            <div className="submit-button-container">
              <button type="submit" disabled={!canSubmit || !isModified()}>
                Zapisz objawy
              </button>
              {existingData && (
                <button
                  className="delete-symptom-button"
                  onClick={handleDelete}
                  type="button"
                >
                  Usuń objawy
                </button>
              )}
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

export default SymptomForm;
