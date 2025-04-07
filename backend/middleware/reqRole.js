/**
 * Middleware sprawdzający, czy użytkownik ma odpowiednią rolę.
 * Używany do ochrony tras tylko dla pacjentek lub tylko dla lekarzy.
 */
function requireRole(expectedRole) {
  return (req, res, next) => {
    // Jeśli rola użytkownika nie pasuje do wymaganej — zwróć błąd 403
    if (req.user.role !== expectedRole) {
      return res.status(403).json({ error: `Dostęp tylko dla roli: ${expectedRole}` });
    }
    // Rola pasuje — kontynuuj
    next();
  };
}

module.exports = requireRole;
