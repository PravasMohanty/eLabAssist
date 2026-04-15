const validateAppointment = (req, res, next) => {
  const { patient_id, disease_id, appointment_date } = req.body;

  if (!patient_id || !disease_id || !appointment_date) {
    return res.status(400).json({
      message: "patient_id, disease_id, appointment_date are required"
    });
  }

  next();
};

module.exports = { validateAppointment };