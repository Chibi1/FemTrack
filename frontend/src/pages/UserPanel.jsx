import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './UserPanel.css';
import SymptomForm from '../components/SymptomForm';


// Zwraca wszystkie dni między startDate a endDate (włącznie)
// Wykorzystywane do podświetlania dni okresu w kalendarzu
function getPeriodDates(start, end) {
  const dates = [];
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// Formatowanie daty do formatu YYYY-MM-DD (wymagany przez backend)
const formatDateOnly = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function UserPanel() {
  const navigate = useNavigate();

  // Dane użytkowniczki
  const [userName, setUserName] = useState('');

  // Aktualnie wybrana data w kalendarzu
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Wybrany dzień w kalendarzu
  const [selectedDay, setSelectedDay] = useState(null);

  // Dane związane z cyklami
  const [cycles, setCycles] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [previousCycle, setPreviousCycle] = useState(null);

  // Mapy i listy dat do podświetleń w kalendarzu
  const [periodDates, setPeriodDates] = useState([]);
  const [ovulationMap, setOvulationMap] = useState({});
  const [symptomDates, setSymptomDates] = useState([]);

  // Tryb edycji okresu
  const [editingMode, setEditingMode] = useState(false);

  // Status zaznaczonego dnia
  const [isPeriodDay, setIsPeriodDay] = useState(false);
  const [isFuture, setIsFuture] = useState(false);

  // Dane formularza objawów
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [symptomData, setSymptomData] = useState(null);
  
  // Pierwsze załadowanie: walidacja tokenu i pobranie danych użytkowniczki
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return (window.location.href = '/');

    fetch('/panel-uzytkowniczki', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          localStorage.clear();
          window.location.href = '/';
          return;
        }
        const data = await res.json();
        setUserName(data.name || '');
      })
      .catch(() => {
        localStorage.clear();
        window.location.href = '/';
      });

    loadCycles();
    loadSymptomDates();
  }, []);

  // Pobranie cykli z backendu i przygotowanie danych do kalendarza
  const loadCycles = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/cycles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCycles(data);

      if (data.length > 0) {
        const last = data[data.length - 1];
        const secondLast = data[data.length - 2] || null;
        setCurrentCycle(last);
        setPreviousCycle(secondLast);

        const allDates = [];
        const ovulations = {};

        data.forEach((cycle) => {
          const dates = getPeriodDates(new Date(cycle.startDate), new Date(cycle.endDate));
          dates.forEach((d) => allDates.push(d.toDateString()));

          if (cycle.ovulationDate) {
            ovulations[new Date(cycle.ovulationDate).toDateString()] = cycle.ovulationType;
          }
        });

        setPeriodDates(allDates);
        setOvulationMap(ovulations);
      } else {
        setCurrentCycle(null);
        setPreviousCycle(null);
        setPeriodDates([]);
        setOvulationMap({});
      }
    } catch {
      alert('Błąd pobierania cykli');
    }
  };

  // Dodanie nowego cyklu
  const handleStartPeriod = async () => {
    if (editingMode) {
      alert('Najpierw zakończ edycję okresu.');
      return;
    }

    const token = localStorage.getItem('token');
    const formattedDate = formatDateOnly(calendarDate);

    try {
      const response = await fetch('/api/cycles/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ startDate: formattedDate }),
      });

      const data = await response.json();
      if (!response.ok) {
        return;
      }

      await loadCycles();
    } catch {
      alert('Wystąpił błąd podczas zapisu');
    }
  };

  // Edycja długości bieżącego cyklu (skrócenie / wydłużenie)
  const handleEditLength = async (delta) => {
    if (!currentCycle) return;
    const token = localStorage.getItem('token');

    const newEnd = new Date(currentCycle.endDate);
    newEnd.setDate(newEnd.getDate() + delta);

    const days = getPeriodDates(currentCycle.startDate, newEnd).length;

    if (days < 1) {
      const confirmed = window.confirm('Czy chcesz usunąć ten cykl?');
      if (confirmed) {
        try {
          await fetch(`/api/cycles/${currentCycle._id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          setEditingMode(false);
          await loadCycles();
        } catch {
          alert('Wystąpił błąd przy usuwaniu cyklu.');
        }
      }
      return;
    }

    try {
      await fetch(`/api/cycles/${currentCycle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ endDate: formatDateOnly(newEnd) }),
      });
      await loadCycles();
    } catch {
      alert('Błąd podczas edycji długości cyklu.');
    }
  };

  // Obsługa kliknięcia w dzień kalendarza
  const handleDayClick = async (date) => {
    if (editingMode) return alert('Najpierw zakończ edycję okresu.');
  
    const today = new Date();
    const clicked = new Date(date);
    today.setHours(0, 0, 0, 0);
    clicked.setHours(0, 0, 0, 0);
  
    setCalendarDate(clicked);
    setSelectedDay(clicked);
    setIsFuture(clicked.getTime() > today.getTime());
    setIsPeriodDay(periodDates.includes(clicked.toDateString()));
    setSymptomData(null); 
    setShowSymptomForm(false); 
  
    // Pobierz dane objawów dla klikniętej daty
    const token = localStorage.getItem('token');
    const formattedDate = formatDateOnly(clicked);
  
    try {
      const res = await fetch(`/api/symptoms/${formattedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        const data = await res.json();
        setSymptomData(data);
      } else if (res.status === 404) {
        setSymptomData(null);
      } 
    } catch (err) {
      console.error('Błąd sieci przy pobieraniu symptomów:', err);
    }
  };
  
  // Pobranie dat z zapisanymi objawami i ich formatowanie do wyświetlenia w kalendarzu
  const loadSymptomDates = async () => {
    const token = localStorage.getItem('token');
  
    try {
      const res = await fetch('/api/symptoms', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = await res.json();
  
      const formattedDates = data.map((d) => new Date(d).toDateString());
  
      setSymptomDates(formattedDates);
  
      return formattedDates;
    } catch (err) {
      console.error('Błąd przy pobieraniu listy dat symptomów:', err);
    }
  };
  
  // Render pojedynczego cyklu z danymi i edycją, jeśli jest to aktualny cykl
  const renderCycle = (cycle, title, isCurrent = false, extraInfo = null) => {
    if (!cycle) return null;
  
    return (
      <div className="cycle-box">
        <h3>{title}</h3>
        <p><strong>Start krwawienia:</strong> {new Date(cycle.startDate).toLocaleDateString()}</p>
        <p><strong>Koniec krwawienia:</strong> {new Date(cycle.endDate).toLocaleDateString()}</p>
        <p><strong>Długość okresu:</strong> {cycle.periodLength} dni</p>
        <p><strong>{cycle.ovulationType === 'confirmed' ? 'Potwierdzona' : 'Przewidywana'} owulacja:</strong> {new Date(cycle.ovulationDate).toLocaleDateString()}</p>
        {extraInfo != null && (<p><strong>Długość całego cyklu:</strong> {extraInfo} dni</p>)}
        {isCurrent && (
          <>
            <button onClick={() => setEditingMode(!editingMode)} className="edit-toggle-btn">
              {editingMode ? 'Zakończ edycję' : 'Edytuj okres'}
            </button>
            <div className={`edit-controls ${editingMode ? 'active' : 'inactive'}`}>
              <button onClick={() => handleEditLength(-1)}>Skróć o 1 dzień</button>
              <button onClick={() => handleEditLength(1)}>Wydłuż o 1 dzień</button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Render komponentu
  return (
    <div className="user-panel">
      {/* Górny pasek z imieniem i przyciskami */}
      <div className="header">
        <h2>Witaj, {userName}!</h2>
          <div className="user-actions">
          <button
            className="profile-button"
            onClick={() => {
              if (editingMode) {
                alert('Najpierw zakończ edycję okresu.');
                return;
              }
              navigate('/panel-uzytkowniczki/profil');
            }}
          >
            Mój profil
          </button>
          <button
            className="logout-button"
            onClick={() => {
              if (editingMode) return alert('Najpierw zakończ edycję okresu.');
              localStorage.clear();
              window.location.href = '/';
            }}
          >
            Wyloguj się
          </button>
        </div>
      </div>

      {/* Główna zawartość: kalendarz + info */}
      <div className="main-content">
        <div className="calendar-container">
          <Calendar
            onClickDay={handleDayClick}
            value={calendarDate}
            tileClassName={({ date }) => {
              const label = date.toDateString();
              const isPeriod = periodDates.includes(label);
              const ovulation = ovulationMap[label];

              if (ovulation === 'confirmed') return 'ovulation-confirmed';
              if (ovulation === 'predicted') return 'ovulation-predicted';
              if (isPeriod) return 'period-day';
              return null;
            }}
            tileContent={({ date, view }) => {
              if (view === 'month') {
                const label = date.toDateString();
                if (symptomDates.includes(label)) {
                  return <span className="symptom-indicator" title="Zapisane objawy">★</span>;
                }
              }
              return null;
            }}
          />

          {/* Przyciski pod kalendarzem */}
          {selectedDay && !isFuture && (
            <>
              {!isPeriodDay && (
                <button
                  onClick={handleStartPeriod}
                  className="start-period-button"
                  disabled={editingMode}
                  style={editingMode ? { opacity: 0.4, pointerEvents: 'none' } : {}}
                >
                  Zaznacz ten dzień jako początek okresu
                </button>
              )}
              <button
                onClick={() => setShowSymptomForm(true)}
                className="start-period-button"
                disabled={editingMode}
                style={editingMode ? { opacity: 0.4, pointerEvents: 'none' } : {}}
              >
                Zanotuj objawy
              </button>

              {/* Formularz objawów w modalu */}
              {showSymptomForm && (
                <SymptomForm
                  date={selectedDay}
                  isPeriodDay={isPeriodDay}
                  existingData={symptomData}
                  onClose={() => setShowSymptomForm(false)}
                  onSubmit={(data) => {
                    const formatted = selectedDay.toDateString();
                    setSymptomDates((prev) => {
                      const newDates = new Set(prev);
                      if (data) {
                        newDates.add(formatted);
                      } else {
                        newDates.delete(formatted);
                      }
                      return Array.from(newDates);
                    });
                    setShowSymptomForm(false);
                  }}
                />
              )}
            </>
          )}
        </div>

        <div className="info-container">
          {currentCycle ? (
            renderCycle(currentCycle, 'Aktualny cykl', true)
          ) : (
            <p className="no-cycle">Brak aktualnego cyklu</p>
          )}

          {previousCycle && currentCycle && (
            renderCycle(previousCycle, 'Poprzedni cykl', false, previousCycle.cycleLength)
          )}
        </div>
      </div>
    </div>
  );
}

export default UserPanel;
