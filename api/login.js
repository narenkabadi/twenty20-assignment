const bcrypt = require("bcryptjs");
const { connectDB } = require("./_db");
const { json, readJson, signToken, setCookie } = require("./_auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { ok: false, message: "Method not allowed" });

  try {
    const { email, password } = await readJson(req);

    if (!email || !password) {
      return json(res, 400, { ok: false, message: "Email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { users } = await connectDB();

    const user = await users.findOne({ email: normalizedEmail });
    if (!user) {
      return json(res, 401, { ok: false, message: "No account found. Please register first." });
    }

    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) {
      return json(res, 401, { ok: false, message: "Invalid credentials." });
    }

    const token = signToken({ userId: String(user._id), name: user.name, email: user.email });
    setCookie(res, "t20_token", token, { maxAge: 60 * 60 * 24 * 7 });

    return json(res, 200, { ok: true, message: "Login successful!" });
  } catch (err) {
    return json(res, 500, { ok: false, message: "Something went wrong. Please try again." });
  }
};
