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

- Intuicyjny kalendarz cyklu z zaznaczonymi dniami okresu i owulacji
- Możliwość notowania objawów, nastroju i dolegliwości (różne formularze dla dni okresowych i nieokresowych)
- Personalizowane alerty zdrowotne na podstawie wprowadzonych danych
- Statystyki cyklu: długość poszczególnych cykli i krwawień przedstawione na wykresach 
- Profil użytkowniczki z możliwością edycji danych i zdjęcia
- Dostęp do listy zweryfikowanych lekarzy
- Czat na żywo z lekarzem
- Historia rozmów z lekarzami
- Formularz wywiadu zdrowotnego w trakcie czatu z lekarzem

---

## Cele i założenia projektu

- Ułatwienie codziennego monitorowania zdrowia i samopoczucia poprzez prowadzenie kalendarza cyklu oraz notowanie objawów fizycznych i emocjonalnych
- Możliwość szybkiej i wygodnej konsultacji z lekarzem – zwłaszcza w sytuacjach niepokoju, takich jak opóźniony okres, silne objawy czy nietypowe zmiany
- Zwiększenie świadomości zdrowotnej i budowanie nawyku regularnej obserwacji własnego cyklu
- Projektowanie i implementacja nowoczesnej aplikacji webowej w architekturze klient-serwer
- Poznanie w praktyce języka JavaScript oraz technologii takich jak React, Node.js, Express i MongoDB
- Zrozumienie mechanizmów autoryzacji, wymiany danych, przesyłania plików i komunikacji w czasie rzeczywistym
- Rozwijanie umiejętności projektowania interfejsu użytkownika

---

## Funkcjonalności

### 👩 Konto użytkowniczki:
- Rejestracja i logowanie
- Dodawanie cykli menstruacyjnych z automatycznym wyliczaniem długości i owulacji
- Notowanie objawów z rozróżnieniem na dni okresowe i nieokresowe
- Edytowalny formularz symptomów i kalendarz z graficznymi oznaczeniami
- System alertów zdrowotnych (nieregularność, opóźnienia, silne objawy)
- Profil z edytowalnymi danymi (imię, e-mail, dane zdrowotne, hasło, zdjęcie profilowe)
- Statystyki cyklu: wykresy długości cykli i krwawień
- Przechowywanie historii wprowadzanych danych

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

## Prezentacja działania aplikacji

Zobacz, jak działa FemTrack w praktyce:

▶ [LINK](https://youtu.be/aqrb2ur2HCo)

---

## Jak uruchomić projekt?

Projekt składa się z dwóch głównych części:

- [Backend](https://github.com/Chibi1/FemTrack/blob/wersja-bez-czatu/backend/README.md)
- [Frontend](https://github.com/Chibi1/FemTrack/blob/wersja-bez-czatu/frontend/README.md)

Aby uruchomić aplikację lokalnie, zapoznaj się z instrukcjami znajdującymi się w powyższych linkach.

### Hosting

Aplikacja została również wdrożona i jest dostępna online:

- Frontend i backend zostały wdrożone na platformie **Render**  
- Wersja demonstracyjna aplikacji dostępna jest pod adresem: [https://femtrack.onrender.com](https://femtrack.onrender.com)

---

## Wygląd aplikacji

### Okno rejestracji
<img width="1680" alt="Zrzut ekranu 2025-06-2 o 21 43 55" src="https://github.com/user-attachments/assets/b5d5f44a-bd4c-41ce-912d-1d3d778e3f98" />

### Okno logowania
<img width="1680" alt="Zrzut ekranu 2025-06-2 o 21 43 50" src="https://github.com/user-attachments/assets/fc3b88f5-d47d-4f36-b279-ca6713795a3a" />

### Panel użytkowniczki
<img width="1680" alt="Zrzut ekranu 2025-06-2 o 21 49 23" src="https://github.com/user-attachments/assets/a7865370-c19c-494e-b070-fdcb4687dc3d" />

### Formularz symptomów
<img width="976" alt="Zrzut ekranu 2025-05-15 o 22 12 37" src="https://github.com/user-attachments/assets/a1bbcd92-4dc2-4fdc-9232-4c8826c0a06e" />

### Statystyki cyklu
<img width="1680" alt="Zrzut ekranu 2025-06-2 o 21 48 16" src="https://github.com/user-attachments/assets/8248d000-954e-480c-898b-2d741fe9378e" />

### Profil użytkowniczki
<img width="495" alt="Zrzut ekranu 2025-05-15 o 22 21 49" src="https://github.com/user-attachments/assets/53666332-f040-45d3-8837-bebda60b08de" />

### Alerty zdrowotne
<img width="1680" alt="Zrzut ekranu 2025-06-2 o 21 54 11" src="https://github.com/user-attachments/assets/4f3bb21c-01dc-400c-a288-c640c2385280" />

---
