# FemTrack – Frontend

To frontend aplikacji służącej do monitorowania cyklu miesiączkowego.  
Aplikacja stworzona w React.

---

## Jak uruchomić frontend?

1. **Sklonuj projekt z GitHuba**

Pobierz folder frontendowy z repozytorium:

```bash
git clone https://github.com/Chibi1/FemTrack
cd FemTrack/frontend
```

---

2. **Zainstaluj zależności (node_modules)**

Wykonaj w terminalu:

```bash
npm install
```

To pobierze wszystkie niezbędne biblioteki, takie jak React, react-router-dom, react-calendar itp.  
Powstanie folder `node_modules`, który jest wymagany do uruchomienia projektu.

---

3. **Utwórz plik `.env` i dodaj dane konfiguracyjne**

W folderze `frontend/` utwórz plik `.env` i wklej:

```
VITE_API_URL=http://localhost:3001
```

---

4. **Uruchom aplikację frontendową**

Wpisz w terminalu:

```bash
npm run dev
```

---

5. **Sprawdź, czy frontend działa**

Wejdź ręcznie na adres:

```
http://localhost:5173
```

---

5. **Upewnij się, że backend jest uruchomiony**

Frontend komunikuje się z backendem, który znajduje się pod adresem:

```
http://localhost:3001
```

Backend musi działać, aby możliwe było logowanie i wyświetlanie danych.
