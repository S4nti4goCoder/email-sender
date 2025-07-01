const {
  saveAndSendEmail,
  getEmailsByUser,
} = require("../services/email.service");

exports.send = async (req, res, next) => {
  try {
    const id = await saveAndSendEmail(req.user.id, req.body);
    res
      .status(201)
      .json({ message: "Email guardado y enviado correctamente", id });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const emails = await getEmailsByUser(req.user.id);
    res.json({ emails });
  } catch (err) {
    next(err);
  }
};
