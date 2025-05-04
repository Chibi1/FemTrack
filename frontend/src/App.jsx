import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AuthPage from './pages/AuthPage';
import UserPanel from './pages/UserPanel';
import DoctorPanel from './pages/DoctorPanel';
import UserProfile from './pages/UserProfile';
import './App.css';

function App() {
  const location = useLocation();

  // Stan uwierzytelnienia użytkownika
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false); // render dopiero po odczycie localStorage

  useEffect(() => {
    // Przy każdej zmianie lokalizacji sprawdzamy token i rolę w localStorage
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');

    setToken(savedToken);
    setRole(savedRole);
    setIsInitialized(true); // renderujemy dopiero po odczycie
  }, [location]);

  const isLoggedIn = token && role;

  // Jeśli aplikacja nie jest gotowa do renderowania, nie pokazuj nic
  if (!isInitialized) {
    return null;
  }

  return (
    <div>
      <Routes>
        {/* Strona główna – logowanie lub przekierowanie na panel */}
        <Route
          path="/"
          element={
            isLoggedIn
              ? role === 'doctor'
                ? <Navigate to="/panel-lekarza" replace />
                : <Navigate to="/panel-uzytkowniczki" replace />
              : <AuthPage />
          }
        />

        {/* Panel użytkowniczki – dostępny tylko dla roli "user" */}
        <Route
          path="/panel-uzytkowniczki"
          element={
            isLoggedIn && role === 'user'
              ? <UserPanel />
              : <Navigate to="/" replace />
          }
        />

        {/* Panel lekarza – dostępny tylko dla roli "doctor" */}
        <Route
          path="/panel-lekarza"
          element={
            isLoggedIn && role === 'doctor'
              ? <DoctorPanel />
              : <Navigate to="/" replace />
          }
        />

        {/* Profil użytkowniczki */}
        <Route
          path="/panel-uzytkowniczki/profil"
          element={
            isLoggedIn && role === 'user'
              ? <UserProfile />
              : <Navigate to="/" replace />
          }
        />

      </Routes>
    </div>
  );
}

export default App;
