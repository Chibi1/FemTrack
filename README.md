# FemTrack
To aplikacja webowa wspierająca zdrowie hormonalne kobiet. Łączy funkcję śledzenia cyklu menstruacyjnego z możliwością bezpośredniego kontaktu z prawdziwym lekarzem.

# O projekcie
W przeciwieństwie do tradycyjnych aplikacji menstruacyjnych, FemTrack będzie oferował:
- intuicyjny kalendarz cyklu,
- możliwość notowania objawów, nastroju i dolegliwości,
- dostęp do listy zweryfikowanych lekarzy,
- czat na żywo z lekarzem
- archiwum rozmów oraz historia konsultacji,
- szybki wywiad lekarski przez predefiniowany formularz.

# Funkcjonalności
👩 Konto użytkowniczki:
- Rejestracja i logowanie
- Wprowadzanie danych o cyklu, objawach, samopoczuciu
- Personalizowane porady na podstawie wprowadzonych danych
- Lista dostępnych lekarzy i możliwość czatu
- Historia rozmów i edycja profilu

🩺 Konto lekarza:
- Status „dostępny” po zalogowaniu
- Odbieranie wiadomości i prowadzenie czatu
- Wgląd w historię konsultacji z użytkowniczkami
- Możliwość przesłania formularza wywiadu

# Planowane technologie
🖼️ Frontend
- React.js – budowa dynamicznego i modularnego interfejsu użytkownika
- Next.js (opcjonalnie) – optymalizacja SEO i SSR
- Tailwind CSS – szybkie i nowoczesne stylowanie
- Recharts – wizualizacja danych cyklu (np. wykresy objawów)
- React Calendar – obsługa kalendarza menstruacyjnego

🔧 Backend
- Node.js + Express.js – serwer API i logika biznesowa
- MongoDB (Mongoose) – baza NoSQL do przechowywania danych użytkowniczek i historii czatu
- JWT + bcrypt.js – bezpieczna autoryzacja i przechowywanie haseł

💬 Czat na żywo (real-time messaging)
- Socket.io – komunikacja w czasie rzeczywistym
- Firebase Firestore (alternatywa, jeśli chcemy ograniczyć backend)

# Status projektu 
Projekt znajduje się w fazie wstępnego rozwoju.

# Zespół
Projekt grupowy realizowany w ramach przedmiotu "Rozwój aplikacji internetowych w medycynie" 

Politechnika Gdańska, 2025

