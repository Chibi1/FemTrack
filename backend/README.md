# FemTrack – Backend

To backend aplikacji służącej do monitorowania cyklu miesiączkowego.  
Aplikacja oparta na Node.js, Express i MongoDB Atlas.

---

## Jak uruchomić backend?

1. **Sklonuj projekt z GitHuba**

Pobierz folder backendowy z repozytorium:

```bash
git clone https://github.com/Chibi1/FemTrack
cd FemTrack/backend
```

---

2. **Zainstaluj zależności (node_modules)**

Wykonaj w terminalu:

```bash
npm install
```

To pobierze wszystkie niezbędne biblioteki, takie jak Express, Mongoose, dotenv itp.  
Powstanie folder `node_modules`, który jest wymagany do uruchomienia projektu.

---

3. **Utwórz plik `.env` i dodaj dane konfiguracyjne**

W folderze `backend/` utwórz plik `.env` i wklej:

```
JWT_SECRET=twoja_bardzo_tajna_wartosc
MONGODB_URI=mongodb+srv://user_2:KO9zhNIl6touqqj2@femtrackdb.dvfyhqd.mongodb.net/?retryWrites=true&w=majority&appName=FemTrackDB
```

- `JWT_SECRET` – klucz do generowania i weryfikacji tokenów logowania
- `MONGODB_URI` – adres połączenia z bazą danych MongoDB Atlas 

---

4. **Uruchom backend**

Wpisz w terminalu:

```bash
nodemon server.js
```

Jeśli nie masz `nodemon`, zainstaluj go globalnie:

```bash
npm install -g nodemon
```

Możesz też uruchomić zwykłym poleceniem:

```bash
node server.js
```

---

5. **Sprawdź, czy serwer działa**

Otwórz przeglądarkę i wejdź na:

```
http://localhost:3001
```

Jeśli wszystko działa poprawnie, zobaczysz komunikat:

```
Serwer działa!
```
