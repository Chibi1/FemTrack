![Politechnika Gdańska](https://pg.edu.pl/files/wimio/styles/large/public/2021-04/logo-pg-eti.png?itok=kGzz7S79)

## Politechnika Gdańska, Wydział Elektroniki, Telekomunikacji i Informatyki  
**Kierunek:** Inżynieria Biomedyczna, specjalność: Informatyka w Medycynie  
**Przedmiot:** Rozwój Aplikacji Internetowych w Medycynie  
**Rok akademicki:** 2024/2025  
**Prowadząca:** *dr inż. Anna Węsierska*

---

**FemTrack** to aplikacja webowa zaprojektowana z myślą o kobietach, umożliwiająca śledzenie cyklu menstruacyjnego oraz szybki kontakt z lekarzem w celu konsultacji. Aplikacja łączy funkcjonalność intuicyjnego kalendarza cyklu z możliwością prowadzenia rozmów w czasie rzeczywistym.

---

## Opis projektu

FemTrack oferuje:

- Intuicyjny kalendarz cyklu z zaznaczeniem dni okresu i owulacji
- Możliwość notowania objawów, nastroju i dolegliwości (różne formularze dla dni okresowych i nieokresowych)
- Personalizowane alerty zdrowotne na podstawie wprowadzonych danych
- Profil użytkowniczki z możliwością edycji danych i zdjęcia
- Dostęp do listy zweryfikowanych lekarzy
- Czat na żywo z lekarzem
- Historia rozmów z lekarzami
- Formularz wywiadu zdrowotnego w czasie czatu

---

## Cele i założenia projektu

- Ułatwienie codziennego monitorowania zdrowia i samopoczucia poprzez prowadzenie kalendarza cyklu oraz notowanie objawów fizycznych i emocjonalnych
- Możliwość szybkiej i wygodnej konsultacji z lekarzem – zwłaszcza w sytuacjach niepokoju, takich jak opóźniony okres, silne objawy czy nietypowe zmiany
- Zwiększenie świadomości zdrowotnej i budowanie nawyku regularnej obserwacji własnego cyklu
- Zaprojektowanie i wdrożenie nowoczesnej aplikacji webowej w architekturze klient-serwer
- Poznanie w praktyce języka JavaScript oraz technologii takich jak React, Node.js, Express i MongoDB
- Zrozumienie mechanizmów autoryzacji, wymiany danych, przesyłania plików i komunikacji w czasie rzeczywistym
- Rozwijanie umiejętności projektowania interfejsu użytkownika oraz budowania skalowalnych systemów webowych

---

## Funkcjonalności

### 👩 Konto użytkowniczki:
- Rejestracja i logowanie
- Dodawanie cykli menstruacyjnych z automatycznym wyliczaniem długości i owulacji
- Notowanie objawów z rozróżnieniem na dni okresowe i nieokresowe
- Edytowalny formularz symptomów i kalendarz z graficznymi oznaczeniami
- System alertów zdrowotnych (nieregularność, opóźnienia, silne objawy)
- Profil z edytowalnymi danymi (imię, e-mail, dane zdrowotne, hasło, zdjęcie profilowe)
- Przechowywanie historii cykli, objawów i rozmów

### 🩺 Konto lekarza:
- Logowanie z użyciem ID i hasła
- Widok dostępnych pacjentek oraz historii ich cykli i objawów
- Status "dostępny" i możliwość prowadzenia czatu
- Przesyłanie formularza wywiadu do pacjentki podczas konsultacji

---

## Technologie

### Frontend:
- **React.js** – modularna architektura i dynamiczny UI
- **CSS** – stylowanie interfejsu użytkownika

### Backend:
- **Node.js + Express.js** – API REST i logika aplikacji
- **MongoDB + Mongoose** – przechowywanie danych użytkowniczek, cykli, symptomów, lekarzy
- **JWT + bcrypt.js** – autoryzacja i bezpieczne logowanie
- **Multer** – obsługa przesyłania zdjęć profilowych

### Komunikacja:
- **Socket.io** – czat na żywo pomiędzy użytkowniczką a lekarzem
- **Firebase Firestore** (alternatywnie) – jako fallback dla komunikacji

---

## Jak uruchomić projekt

Projekt składa się z dwóch głównych części:

- [Frontend (React)](https://github.com/Chibi1/FemTrack/blob/development/rej-log-panel-uzytkowniczki/frontend/README.md)
- [Backend (Node.js + Express)](https://github.com/Chibi1/FemTrack/blob/development/rej-log-panel-uzytkowniczki/backend/README.md)

Aby uruchomić aplikację lokalnie, zapoznaj się z instrukcjami znajdującymi się w powyższych plikach.

---

## Wygląd aplikacji

Okno rejestracji
<img width="976" alt="Zrzut ekranu 2025-05-15 o 22 10 16" src="https://github.com/user-attachments/assets/b05a70f3-af63-4a0e-8320-d1a0ca5479af" />

Okno logowania
<img width="976" alt="Zrzut ekranu 2025-05-15 o 22 11 07" src="https://github.com/user-attachments/assets/6b83439e-719f-4d71-b482-9f8e387ca4f8" />

Panel użytkowniczki
<img width="958" alt="Zrzut ekranu 2025-05-15 o 22 12 02" src="https://github.com/user-attachments/assets/c046b7fb-ca86-48d8-a095-375533faddbc" />

Formularz symptomów
<img width="917" alt="Zrzut ekranu 2025-05-15 o 22 12 37" src="https://github.com/user-attachments/assets/a1bbcd92-4dc2-4fdc-9232-4c8826c0a06e" />

Profil użytkowniczki
<img width="489" alt="Zrzut ekranu 2025-05-15 o 22 13 20" src="https://github.com/user-attachments/assets/d76602e5-a404-425b-9d6a-8ba0ea2feed8" />

Alerty zdrowotne
<img width="935" alt="Zrzut ekranu 2025-05-15 o 22 14 06" src="https://github.com/user-attachments/assets/4446a07e-0f00-4837-a936-d58e9248b932" />

---
