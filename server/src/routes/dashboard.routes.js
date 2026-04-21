const express = require("express");
const router = express.Router();

const {
  getDashboardOverview,
  getRecentAppointments,
  getPendingLabs
} = require("../controllers/dashboard.controller");

router.get("/overview", getDashboardOverview);
router.get("/recent-appointments", getRecentAppointments);
router.get("/pending-labs", getPendingLabs);

module.exports = router;
