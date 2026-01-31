const bcrypt = require("bcryptjs");
const { connectDB } = require("./_db");
const { json, readJson } = require("./_auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { ok: false, message: "Method not allowed" });

  try {
    const { name, email, password, phone, github, linkedin } = await readJson(req);

    if (!name || !email || !password) {
      return json(res, 400, { ok: false, message: "Name, email, and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return json(res, 400, { ok: false, message: "Please enter a valid email." });
    }

    if (String(password).length < 6) {
      return json(res, 400, { ok: false, message: "Password must be at least 6 characters." });
    }

    const { users } = await connectDB();
    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) {
      return json(res, 409, { ok: false, message: "User already exists. Please login." });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    await users.insertOne({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone ? String(phone).trim() : "",
      github: github ? String(github).trim() : "",
      linkedin: linkedin ? String(linkedin).trim() : "",
      createdAt: new Date(),
    });

    return json(res, 200, { ok: true, message: "Registration successful! You can login now." });
  } catch (err) {
    return json(res, 500, { ok: false, message: "Something went wrong. Please try again." });
  }
};
