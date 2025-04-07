import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './UserPanel.css';

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
  // Dane użytkowniczki i aktualnie zaznaczona data w kalendarzu
  const [userName, setUserName] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Dane związane z cyklami
  const [cycles, setCycles] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [previousCycle, setPreviousCycle] = useState(null);

  // Dane do oznaczania dni w kalendarzu
  const [periodDates, setPeriodDates] = useState([]);
  const [ovulationMap, setOvulationMap] = useState({});

  // Tryb edycji bieżącego cyklu
  const [editingMode, setEditingMode] = useState(false);

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

  // Edycja długości bieżącego cyklu (skrót / wydłużenie)
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

  // Render pojedynczego cyklu z danymi i edycją, jeśli aktualny
  const renderCycle = (cycle, title, isCurrent = false) => {
    if (!cycle) return null;

    return (
      <div className="cycle-box">
        <h3>{title}</h3>
        <p><strong>Start krwawienia:</strong> {new Date(cycle.startDate).toLocaleDateString()}</p>
        <p><strong>Koniec krwawienia:</strong> {new Date(cycle.endDate).toLocaleDateString()}</p>
        <p><strong>Długość okresu:</strong> {cycle.periodLength} dni</p>
        <p><strong>Przewidywana owulacja:</strong> {new Date(cycle.ovulationDate).toLocaleDateString()}</p>

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

  return (
    <div className="user-panel">
      <div className="header">
        <h2>Witaj, {userName}!</h2>
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

      <div className="main-content">
        <div className="calendar-container">
          <Calendar
            onChange={(date) => {
              if (editingMode) return alert('Najpierw zakończ edycję okresu.');
              setCalendarDate(date);
            }}
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
          />

          {calendarDate && !periodDates.includes(calendarDate.toDateString()) && (
            <button
              onClick={handleStartPeriod}
              className="start-period-button"
              disabled={editingMode}
              style={editingMode ? { opacity: 0.4, pointerEvents: 'none' } : {}}
            >
              Zaznacz ten dzień jako początek okresu
            </button>
          )}
        </div>

        <div className="info-container">
            {currentCycle ? (
              renderCycle(currentCycle, 'Aktualny cykl', true)
            ) : (
              <p className="no-cycle">Brak aktualnego cyklu</p>
            )}
        </div>
      </div>
    </div>
  );
}

export default UserPanel;
