const express = require("express");

const { validateAppointment } = require("../middleware/auth.middleware");

const {
  createAppointment,
  deleteAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus
} = require("../controllers/appointment.controller");

const router = express.Router();

router.post("/appointment", validateAppointment, createAppointment);
router.get("/allappointment", getAllAppointments);
router.get("/appointment/:id", getAppointmentById);
router.patch("/appointment/:id/status", updateAppointmentStatus);
router.delete("/appointment/:id", deleteAppointment);

module.exports = router;