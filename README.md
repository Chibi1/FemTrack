# FemTrack

**FemTrack** to aplikacja webowa zaprojektowana z myślą o kobietach, umożliwiająca śledzenie cyklu menstruacyjnego oraz szybki kontakt z lekarzem w celu konsultacji. Aplikacja łączy funkcjonalność intuicyjnego kalendarza cyklu z możliwością prowadzenia rozmów w czasie rzeczywistym.

---

## O projekcie

FemTrack oferuje:

- Intuicyjny kalendarz cyklu z zaznaczeniem dni okresu i owulacji
- Możliwość notowania objawów, nastroju i dolegliwości (różne formularze dla dni okresowych i nieokresowych)
- Personalizowane alerty zdrowotne na podstawie wprowadzonych danych
- Profil użytkowniczki z możliwością edycji danych i zdjęcia
- Dostęp do listy zweryfikowanych lekarzy
- Czat na żywo z lekarzem
- Archiwum rozmów i historia konsultacji
- Formularz wywiadu zdrowotnego w czasie czatu

---

## Funkcjonalności

### 👩 Konto użytkowniczki:
- Rejestracja i logowanie
- Dodawanie cykli menstruacyjnych z automatycznym wyliczaniem długości i owulacji
- Notowanie objawów z rozróżnieniem na dni okresowe i nieokresowe
- Edytowalny formularz symptomów i kalendarz z graficznymi oznaczeniami
- System alertów zdrowotnych (nieregularność, opóźnienia, silne objawy)
- Profil z edytowalnymi danymi (imię, e-mail, dane zdrowotne, hasło, zdjęcie profilowe)
- Przechowywanie historii cykli, objawów i konsultacji

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

### Real-time messaging:
- **Socket.io** – czat na żywo pomiędzy użytkowniczką a lekarzem
- **Firebase Firestore** (alternatywnie) – jako fallback dla komunikacji

---

## Status projektu

Projekt znajduje się w **aktywnym rozwoju**. Aktualnie wdrożone są główne funkcje cyklu, objawów i profilu.

---

## 👥 Zespół

Projekt grupowy realizowany w ramach przedmiotu:  
**"Rozwój aplikacji internetowych w medycynie"**  
Opiekun: *dr inż. Anna Węsierska*  
**Politechnika Gdańska, 2025**

---
