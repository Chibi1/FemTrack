// Uruchomienie serwera – pierwszy log, zanim zaczną się jakiekolwiek operacje
console.log('Startuję aplikację...');

// Załaduj zmienne środowiskowe z pliku .env (JWT_SECRET)
require('dotenv').config();

// Import bibliotek serwera i middleware
const express = require('express');           // Framework HTTP do tworzenia API
const mongoose = require('mongoose');         // Komunikacja z MongoDB
const cors = require('cors');                 // Pozwala na połączenia z frontendu

// Import tras API i middleware'ów do uwierzytelniania i autoryzacji
const authRoutes = require('./routes/auth');              
const cycleRoutes = require('./routes/cycles');
const symptomRoutes = require('./routes/symptoms');           
const authenticate = require('./middleware/authenticate'); 
const requireRole = require('./middleware/reqRole');  

// Model użytkownika – używany do pobierania imienia do panelu
const User = require('./models/User');

// Inicjalizacja aplikacji Express
const app = express();

// Konfiguracja CORS – umożliwia komunikację frontend <-> backend
app.use(cors({
  origin: 'http://localhost:5173',               // Adres frontendu (Vite)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],     // Dozwolone metody HTTP
  allowedHeaders: ['Content-Type', 'Authorization'] // Dozwolone nagłówki 
}));

// Parsowanie JSON-ów w przychodzących żądaniach
app.use(express.json());

// Próba połączenia z lokalną bazą MongoDB
console.log('Próba połączenia z MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Połączono z MongoDB');

    // Rejestracja tras API
    app.use('/api/auth', authRoutes);       // Rejestracja i logowanie
    app.use('/api/cycles', cycleRoutes);    // Operacje na cyklach menstruacyjnych
    app.use('/api/symptoms', symptomRoutes); // Operacje na objawach

    // Prosty endpoint testowy
    app.get('/', (req, res) => {
      res.send('Serwer działa!');
    });

    // Panel lekarza – tylko po autoryzacji i z rolą "doctor"
    app.get('/panel-lekarza', authenticate, requireRole('doctor'), (req, res) => {
      res.json({ message: `Witaj, lekarzu! Twoje ID to: ${req.user.userId}` });
    });

    // Panel użytkowniczki – tylko po autoryzacji i z rolą "user"
    app.get('/panel-uzytkowniczki', authenticate, requireRole('user'), async (req, res) => {
      try {
        // Pobranie imienia użytkowniczki z bazy (na podstawie ID z tokenu)
        const user = await User.findById(req.user.userId).select('name');
        if (!user) {
          return res.status(404).json({ error: 'Nie znaleziono użytkowniczki' });
        }

        // Odpowiedź z imieniem – używane do powitania
        res.json({
          message: `Witaj, ${user.name}!`,
          name: user.name
        });
      } catch (err) {
        console.error('Błąd pobierania użytkowniczki:', err);
        res.status(500).json({ error: 'Błąd serwera' });
      }
    });

    // Uruchomienie serwera na porcie 3001
    const PORT = 3001;
    app.listen(PORT, () => {
      console.log(`Serwer nasłuchuje na http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // Obsługa błędu połączenia z MongoDB
    console.error('Błąd połączenia z MongoDB:', err.message);
  });
