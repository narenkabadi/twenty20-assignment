const { connectDB } = require("./_db");
const { json, parseCookies, verifyToken } = require("./_auth");

module.exports = async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { ok: false, message: "Method not allowed" });

  const cookies = parseCookies(req);
  const token = cookies.t20_token;
  if (!token) return json(res, 401, { ok: false, user: null });

  const payload = verifyToken(token);
  if (!payload) return json(res, 401, { ok: false, user: null });

  try {
    const { users } = await connectDB();
    const user = await users.findOne({ email: payload.email }, { projection: { passwordHash: 0 } });
    if (!user) return json(res, 401, { ok: false, user: null });
    return json(res, 200, { ok: true, user });
  } catch {
    return json(res, 500, { ok: false, user: null });
  }
};
