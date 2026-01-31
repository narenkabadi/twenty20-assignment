const { json, setCookie } = require("./_auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { ok: false, message: "Method not allowed" });

  setCookie(res, "t20_token", "", { maxAge: 0 });
  return json(res, 200, { ok: true });
};
