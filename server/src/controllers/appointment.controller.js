const { prisma } = require("../config/db");

//  CREATE APPOINTMENT
const createAppointment = async (req, res, next) => {
  try {
    const { patient_id, disease_id, appointment_date, notes } = req.body;

    const doctor = await prisma.doctor.findFirst({
      where: {
        diseases: {
          some: {
            disease_id: disease_id
          }
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({
        message: "No doctor available for this disease"
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patient_id,
        doctor_id: doctor.doctor_id,
        disease_id,
        appointment_date: new Date(appointment_date),
        notes
      },
      include: {
        patient: true,
        doctor: true,
        disease: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Appointment Done",
      data: appointment
    });

  } catch (error) {
    next(error);
  }
};


//  GET ALL
const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        doctor: true,
        disease: true
      },
      orderBy: {
        created_at: "desc"
      }
    });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (error) {
    next(error);
  }
};


//  GET BY ID
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { appointment_id: Number(id) },
      include: {
        patient: true,
        doctor: true,
        disease: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    next(error);
  }
};


//  UPDATE STATUS
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.appointment.update({
      where: { appointment_id: Number(id) },
      data: { status }
    });

    res.json({
      success: true,
      message: "Status updated",
      data: updated
    });

  } catch (error) {
    next(error);
  }
};


// DELETE
const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.appointment.delete({
      where: { appointment_id: Number(id) }
    });

    res.json({
      success: true,
      message: "Appointment deleted"
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment
};