import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev_only_insecure_secret_change_me";

export function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    SECRET,
    { expiresIn: "7d" }
  );
}

// Verifies the token and attaches req.user. All dashboard routes sit
// behind this, so there is no way to reach vendor/admin/etc data without
// a valid session for that specific role.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not logged in" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Session expired, please log in again" });
  }
}

// Per-role gate, e.g. requireRole('vendor', 'admin')
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized for this dashboard" });
    }
    next();
  };
}
