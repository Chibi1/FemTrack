import { useEffect, useState } from 'react';
import './CycleStatisticsModal.css';

// Pomocnicza funkcja do obliczenia daty zakończenia okresu
function getEndOfPeriod(startDate, periodLength) {
  const start = new Date(startDate);
  start.setDate(start.getDate() + periodLength - 1);
  return start.toISOString().split('T')[0];
}

export default function CycleStatisticsModal({ onClose }) {
  // Stan przechowujący dane statystyczne cykli pobrane z backendu
  const [data, setData] = useState([]);

  // Pobranie danych po załadowaniu komponentu
  useEffect(() => {
    fetch('/api/cycles/statistics', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error('Błąd pobierania statystyk:', err));
  }, []);

  // Obliczenie średniej długości cyklu na podstawie dostępnych danych
  const avg = () => {
    const valid = data.filter(d => d.cycleLength != null);
    const sum = valid.reduce((acc, val) => acc + val.cycleLength, 0);
    return valid.length ? Math.round(sum / valid.length) : '–';
  };

  return (
    <div className="cycle-modal-overlay">
      <div className="cycle-modal-content">
        {/* Przycisk zamykający modal */}
        <button className="close-btn" onClick={onClose}>×</button>

        {/* Nagłówek i informacja o średniej długości cyklu */}
        <h2>📊 Twoje statystyki cyklu</h2>
        <p>Średnia długość cyklu: {avg()} dni</p>

        {/* Wykres długości cyklu */}
        <h3>Długość cyklu</h3>
        <div className="chart-list">
          {data.map((d, index) => (
            <div className="chart-row" key={index}>
              <span className="dates">{d.startDate} – {d.endDate}</span>
              <div className="bar-container">
                {d.cycleLength && (
                  <div className="bar-cycle" style={{ width: `${d.cycleLength * 5}px` }} />
                )}
              </div>
              <span className="length">{d.cycleLength ? `${d.cycleLength} dni` : '...'}</span>
            </div>
          ))}
        </div>

        {/* Wykres długości krwawienia */}
        <h3>Długość krwawienia</h3>
        <div className="chart-list">
          {data.map((d, index) => (
            <div className="chart-row" key={`period-${index}`}>
              <span className="dates">{d.startDate} – {getEndOfPeriod(d.startDate, d.periodLength)}</span>
              <div className="bar-container">
                <div className="bar-period" style={{ width: `${d.periodLength * 5}px` }} />
              </div>
              <span className="length">{d.periodLength} dni</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
