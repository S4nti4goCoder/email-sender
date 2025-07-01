const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} = require("../services/auth.service");

exports.register = async (req, res, next) => {
  try {
    const userId = await registerUser(req.body.email, req.body.password);
    res
      .status(201)
      .json({ message: "Usuario registrado exitosamente", userId });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await loginUser(
      req.body.email,
      req.body.password
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ message: "Login exitoso", accessToken });
  } catch (err) {
    next(err);
  }
};

exports.refresh = (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ error: "No se encontró refresh token" });
    }
    const newAccessToken = refreshAccessToken(token);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) logoutUser(token);
  res.clearCookie("refreshToken", {
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logout exitoso" });
};
