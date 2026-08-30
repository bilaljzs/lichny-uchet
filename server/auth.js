const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";

function signToken(user) {
  return jwt.sign({ sub: user.id, login: user.login }, JWT_SECRET, { expiresIn: "30d" });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Нет токена авторизации" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    req.userLogin = payload.login;
    next();
  } catch {
    return res.status(401).json({ error: "Токен недействителен или истёк" });
  }
}

module.exports = { signToken, requireAuth, JWT_SECRET };
