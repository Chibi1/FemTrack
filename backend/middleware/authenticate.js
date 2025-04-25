const jwt = require('jsonwebtoken');

/**
 * Middleware uwierzytelniający użytkownika na podstawie tokenu JWT.
 * Oczekuje nagłówka: Authorization: "Bearer <token>"
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  // Sprawdzenie obecności nagłówka i formatu tokena
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Brak tokena lub nieprawidłowy format' });
  }

  // Wyciągnięcie tokena (bez "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Weryfikacja tokena przy użyciu sekretu JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Dodanie danych użytkownika do obiektu `req`
    req.user = decoded;

    // Przekazanie dalej do kolejnego middleware'a (reqRole.js)
    next();
  } catch (err) {
    // Token nieprawidłowy lub wygasły
    return res.status(403).json({ error: 'Nieprawidłowy lub wygasły token' });
  }
}

module.exports = authenticate;
