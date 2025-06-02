import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';      // Styl dla strony logowania/rejestracji

/**
 * Komponent AuthPage odpowiada za obsługę formularza logowania i rejestracji.
 * Zmienia tryb działania między logowaniem a rejestracją.
 * Wysyła dane do backendu i zapisuje token oraz rolę w localStorage.
 */
function AuthPage() {
  const [isRegister, setIsRegister] = useState(false); // true = rejestracja, false = logowanie
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user', // domyślnie użytkowniczka
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Aktualizacja pól formularza
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Obsługa wysłania formularza (login/rejestracja)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (isRegister && formData.password.length < 6) {
      setErrorMessage('Hasło musi mieć co najmniej 6 znaków.');
      return;
    }

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const body = isRegister
      ? JSON.stringify({ ...formData, role: 'user' })  // wymuszenie roli "user"
      : JSON.stringify(formData);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,  
    });

      const data = await res.json();

      if (!res.ok) {
        // Obsługa znanych błędów zwróconych przez backend
        switch (res.status) {
          case 409:
            setErrorMessage('Masz już konto. Zaloguj się.');
            break;
          case 404:
            setErrorMessage('Nie znaleziono konta z takim adresem email.');
            break;
          case 401:
            setErrorMessage('Nieprawidłowe hasło.');
            break;
          default:
            setErrorMessage(data.error || 'Wystąpił błąd. Spróbuj ponownie.');
        }
        return;
      }

      if (isRegister) {
        setSuccessMessage('Zarejestrowano pomyślnie. Możesz się teraz zalogować.');
        setIsRegister(false);
        return;
      }

      // Logowanie — zapis tokenu i roli
      if (data.token && data.role) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        const path = data.role === 'doctor'
          ? '/panel-lekarza'
          : '/panel-uzytkowniczki';

        navigate(path);
      } else {
        setErrorMessage('Błąd: brak tokenu lub roli w odpowiedzi.');
      }
    } catch {
      setErrorMessage('Błąd połączenia z serwerem.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-title">FemTrack 🌸</h1>
        <h2 className="auth-subtitle">{isRegister ? 'Rejestracja' : 'Logowanie'}</h2>

        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {isRegister && (
            <input
              type="text"
              name="name"
              placeholder="Imię"
              required
              onChange={handleChange}
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="E-mail"
            required
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Hasło"
            required
            onChange={handleChange}
          />

          <button type="submit">
            {isRegister ? 'Zarejestruj się' : 'Zaloguj się'}
          </button>
        </form>

        <div className="auth-link">
          {isRegister ? 'Masz już konto?' : 'Nie masz konta?'}{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsRegister(!isRegister);
              setErrorMessage('');
              setSuccessMessage('');
            }}
          >
            {isRegister ? 'Zaloguj się' : 'Zarejestruj się'}
          </a>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
