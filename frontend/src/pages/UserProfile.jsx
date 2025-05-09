import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();

  // Główny stan formularza – zawiera wszystkie dane profilu.
  // `profileImage` może być plikiem (gdy użytkowniczka wybierze nowe zdjęcie) lub nazwą pliku z backendu.
  // `previewImage` to lokalny adres podglądu do użycia w <img src=...>
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    height: '',
    weight: '',
    cycleLength: '',
    periodLength: '',
    hormonalContraception: false,
    contraceptionType: '',
    takesMeds: false,
    meds: '',
    hasChronicIllness: false,
    chronicIllness: '',
    lastGynecologistVisit: '',
    profileImage: null,      // File lub string
    previewImage: null       // Ścieżka do podglądu zdjęcia
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false); // Czy pokazać pola hasła
  const [editingPersonalData, setEditingPersonalData] = useState(false); // Czy użytkowniczka edytuje dane osobowe
  const [originalData, setOriginalData] = useState({ name: '', email: '' }); // Dane imię/email do cofnięcia zmian
  const [initialFormData, setInitialFormData] = useState(null); // Oryginalne dane całego formularza

  // Konwertuje daty z formatu ISO na format YYYY-MM-DD dla input type="date"
  const formatDateInput = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0];
  };

  // Sprawdza, czy jakiekolwiek pole w formularzu zostało zmienione względem oryginału
  const isFormChanged = () => {
    if (!initialFormData) return false;

    const current = { ...formData };
    const original = { ...initialFormData };

    // Pomijamy pole pomocnicze do podglądu zdjęcia (nieistotne dla backendu)
    delete current.previewImage;
    delete original.previewImage;

    // Nieporównywanie pustych pól hasła
    if (!current.password) delete current.password;
    if (!current.confirmPassword) delete current.confirmPassword;
    if (!original.password) delete original.password;
    if (!original.confirmPassword) delete original.confirmPassword;

    // Jeśli zdjęcie zostało zmienione (nowy File), traktujemy to jako zmianę
    if (current.profileImage instanceof File) return true;

    // Sprawdzamy, czy jakiekolwiek inne pole się zmieniło
    return JSON.stringify(current) !== JSON.stringify(original);
  };

  // Po załadowaniu komponentu pobieramy dane użytkowniczki z backendu
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!res.ok) throw new Error('Błąd pobierania danych');

        const data = await res.json();

        // Przygotowanie pól – konwersja dat i ustawienie ścieżki do zdjęcia
        const preparedData = {
          ...data,
          birthdate: formatDateInput(data.birthdate),
          lastGynecologistVisit: formatDateInput(data.lastGynecologistVisit),
          previewImage: data.profileImage
            ? `http://localhost:3001/uploads/${data.profileImage}` // zdjęcie z backendu
            : '/avatar.png' // domyślny avatar
        };

        // Ustaw dane do formularza i zapamiętaj wersję początkową
        setFormData(preparedData);
        setInitialFormData({
          ...preparedData,
          profileImage: data.profileImage // tylko string, nie obiekt File
        });

      } catch (err) {
        console.error('Błąd ładowania profilu:', err);
      }
    };

    fetchProfile();
  }, []);

  // Reaguje na zmiany w polach formularza (teksty, checkboxy, pliki itp.)
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'checkbox') {
      // Zmiana checkboxa + czyszczenie zależnych pól jeśli odznaczone
      setFormData((prev) => {
        const updated = { ...prev, [name]: checked };

        if (name === 'hormonalContraception' && !checked) updated.contraceptionType = '';
        if (name === 'hasChronicIllness' && !checked) updated.chronicIllness = '';
        if (name === 'takesMeds' && !checked) updated.meds = '';

        return updated;
      });

    } else if (type === 'file') {
      // Użytkowniczka wybrała nowe zdjęcie profilowe
      const file = files[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          profileImage: file,                             // plik do wysłania
          previewImage: URL.createObjectURL(file),       // tymczasowy podgląd
        }));
      }

    } else {
      // Pozostałe pola (tekst, liczba, data)
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Obsługa kliknięcia "Zapisz zmiany"
  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = { ...formData };

    // Walidacja e-maila
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Podaj poprawny adres e-mail.');
      return;
    }

    if (showPasswordFields) {
      if (
        !formData.currentPassword ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        alert('Aby zmienić hasło, uzupełnij wszystkie pola.');
        return;
      }
    
      if (formData.password.length < 6) {
        alert('Nowe hasło musi mieć co najmniej 6 znaków');
        return;
      }
    
      if (formData.password !== formData.confirmPassword) {
        alert('Nowe hasła nie są takie same');
        return;
      }
    
      // Dodaj wszystkie 3 do updatedData
      updatedData.currentPassword = formData.currentPassword;
      updatedData.password = formData.password;
      updatedData.confirmPassword = formData.confirmPassword;
    } else {
      // Usuń wszystkie 3, jeśli nie ma zmiany hasła
      delete updatedData.currentPassword;
      delete updatedData.password;
      delete updatedData.confirmPassword;
    }

    // Jeśli użytkowniczka wybrała nowe zdjęcie – wysyłamy je osobno
    if (formData.profileImage instanceof File) {
      const formDataImage = new FormData();
      formDataImage.append('profileImage', formData.profileImage);

      try {
        const imgRes = await fetch('/api/profile/upload-avatar', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formDataImage,
        });

        if (!imgRes.ok) {
          console.error('Błąd przy zapisie zdjęcia profilowego');
          alert('Nie udało się zapisać zdjęcia profilowego');
        } else {
          const imgData = await imgRes.json();

          // Po sukcesie: zaktualizuj nazwę pliku i podgląd
          setFormData((prev) => ({
            ...prev,
            profileImage: imgData.profileImage,
            previewImage: `http://localhost:3001/uploads/${imgData.profileImage}`,
          }));
        }
      } catch (err) {
        console.error('Błąd sieci przy zapisie zdjęcia:', err);
        alert('Błąd połączenia przy zapisie zdjęcia');
      }
    }

    // Usuwamy niepotrzebne pola
    delete updatedData.previewImage;
    if (updatedData.profileImage instanceof File) {
      delete updatedData.profileImage; // bo już przesłane osobno
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const data = await res.json();
        if (window.confirm('Dane zostały zapisane! Czy chcesz wrócić do kalendarza?')) {
          navigate('/panel-uzytkowniczki', { state: { refreshAlerts: true } });
        }

        // Po zapisie resetujemy pola hasła i cofamy edycję imienia/emaila
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          password: '',
          confirmPassword: '',
          name: data.name,
          email: data.email,
        }));
        setEditingPersonalData(false);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Błąd przy zapisie danych');
      }
    } catch (err) {
      console.error('Błąd sieci:', err);
      alert('Błąd połączenia z serwerem');
    }
  };

  // Obsługa usuwania konta użytkowniczki
  const handleDelete = async () => {
    const confirmed = window.confirm('Czy na pewno chcesz usunąć konto? Tej operacji nie można cofnąć.');
    if (!confirmed) return;

    try {
      const res = await fetch('/api/auth/delete-self', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.ok) {
        localStorage.clear();
        alert('Twoje konto zostało usunięte.');
        window.location.href = '/';
      } else {
        const err = await res.json();
        alert(err.error || 'Błąd przy usuwaniu konta');
      }
    } catch (err) {
      alert('Wystąpił problem z połączeniem.');
      console.error('Błąd połączenia:', err);
    }
  };

  return (
    <div className="profile-container">
      {/* Nagłówek z awatarem i danymi osobowymi */}
      <div className="profile-header">
        {/* Awatar */}
        <div className="image-column">
          <label htmlFor="profileImageInput" className="avatar-wrapper">
            <img
              src={formData.previewImage || '/avatar.png'}
              alt="Profil"
              className="avatar-preview"
            />
          </label>
          <input
            type="file"
            id="profileImageInput"
            accept="image/*"
            name="profileImage"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Dane osobowe (imię, email) */}
        <div className="info-column">
          <h2>Twój profil</h2>

          {/* Pole: Imię */}
          <div className="field-row">
            <label>Imię:</label>
            <div className="static-wrapper">
              {editingPersonalData ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="static-like-input"
                />
              ) : (
                <span className="static-like-input">{formData.name}</span>
              )}
            </div>
          </div>

          {/* Pole: Email */}
          <div className="field-row">
            <label>Email:</label>
            <div className="static-wrapper">
              {editingPersonalData ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="static-like-input"
                />
              ) : (
                <span className="static-like-input">{formData.email}</span>
              )}
            </div>
          </div>

          {/* Przycisk: Zmień dane osobowe / Anuluj */}
          <div className="personal-actions">
            {!editingPersonalData ? (
              <button
                type="button"
                className="edit-personal-button"
                onClick={() => {
                  setOriginalData({ name: formData.name, email: formData.email });
                  setEditingPersonalData(true);
                }}
              >
                Zmień dane osobowe
              </button>
            ) : (
              <button
                type="button"
                className="edit-personal-button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    name: originalData.name,
                    email: originalData.email,
                  }));
                  setEditingPersonalData(false);
                }}
              >
                Anuluj
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Główny formularz danych zdrowotnych */}
      <form className="profile-form-row">
        {/* Lewa kolumna */}
        <div className="form-left">
          <label>Data urodzenia:</label>
          <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} />

          <label>Wzrost (cm):</label>
          <input type="number" name="height" value={formData.height} onChange={handleChange} />

          <label>Waga (kg):</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} />

          <label>Średnia długość cyklu (dni):</label>
          <input type="number" name="cycleLength" value={formData.cycleLength} onChange={handleChange} />

          <label>Średnia długość okresu (dni):</label>
          <input type="number" name="periodLength" value={formData.periodLength} onChange={handleChange} />

          <label>Ostatnia wizyta u ginekologa:</label>
          <input
            type="date"
            name="lastGynecologistVisit"
            value={formData.lastGynecologistVisit}
            onChange={handleChange}
          />
        </div>

        {/* Prawa kolumna: checkboxy i pola warunkowe */}
        <div className="form-right">
          {/* Antykoncepcja */}
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="hormonalContraception"
              name="hormonalContraception"
              checked={formData.hormonalContraception}
              onChange={handleChange}
            />
            <label htmlFor="hormonalContraception">Stosuję antykoncepcję hormonalną</label>
          </div>

          {formData.hormonalContraception && (
            <div className="nested-field">
              <label className="nested-label">Rodzaj antykoncepcji:</label>
              <select
                name="contraceptionType"
                value={formData.contraceptionType}
                onChange={handleChange}
              >
                <option value="">Wybierz</option>
                <option value="tabletki">Tabletki</option>
                <option value="plastry">Plastry</option>
                <option value="krążki">Krążki dopochwowe</option>
                <option value="zastrzyki">Zastrzyki</option>
                <option value="implat">Implant podskórny</option>
                <option value="wkładka">Wkładka wewnątrzmaciczna</option>
              </select>
            </div>
          )}

          {/* Choroby przewlekłe */}
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="hasChronicIllness"
              name="hasChronicIllness"
              checked={formData.hasChronicIllness}
              onChange={handleChange}
            />
            <label htmlFor="hasChronicIllness">Choruję przewlekle</label>
          </div>

          {formData.hasChronicIllness && (
            <div className="nested-field">
              <label className="nested-label">Na co chorujesz?</label>
              <textarea name="chronicIllness" value={formData.chronicIllness} onChange={handleChange} />
            </div>
          )}

          {/* Stałe leki */}
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="takesMeds"
              name="takesMeds"
              checked={formData.takesMeds}
              onChange={handleChange}
            />
            <label htmlFor="takesMeds">Przyjmuję stale leki</label>
          </div>

          {formData.takesMeds && (
            <div className="nested-field">
              <label className="nested-label">Jakie leki?</label>
              <textarea name="meds" value={formData.meds} onChange={handleChange} />
            </div>
          )}
        </div>
      </form>

      {/* Sekcja z hasłem, usuwaniem konta i przyciskami */}
      <div className="form-footer">
        {/* Zmiana hasła */}
        <div className="action-row">
          <p className="password-hint">Chcesz zmienić hasło?</p>
          <button
            type="button"
            className="action-button"
            onClick={() => setShowPasswordFields(!showPasswordFields)}
          >
            {showPasswordFields ? 'Anuluj' : 'Zmień hasło'}
          </button>
        </div>

        {/* Pola hasła */}
        {showPasswordFields && (
          <>
            <label>Obecne hasło:</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword || ''}
              onChange={handleChange}
            />
            <label>Nowe hasło:</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} />
            <label>Potwierdź hasło:</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
          </>
        )}

        {/* Usuwanie konta */}
        <div className="action-row">
          <p className="password-hint">Chcesz usunąć konto?</p>
          <button
            type="button"
            className="action-button delete"
            onClick={handleDelete}
          >
            Usuń konto
          </button>
        </div>

        {/* Zapisz zmiany */}
        <button
          type="button"
          className="save-button"
          onClick={handleSubmit}
          disabled={!isFormChanged()}
        >
          Zapisz zmiany
        </button>

        {/* Powrót do panelu użytkowniczki */}
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/panel-uzytkowniczki")}
        >
          Powróć do widoku kalendarza
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
