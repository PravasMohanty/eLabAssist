import prisma from "../utils/prisma.js";
//create report
export const createReport = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { parameters, remarks, pathologistId } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { appointment_id: Number(appointmentId) },
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "COMPLETED") {
      return res.status(400).json({
        message: "Appointment must be completed first",
      });
    }


    const existingReport = await prisma.report.findUnique({
      where: { appointment_id: Number(appointmentId) },
    });

    if (existingReport) {
      return res.status(400).json({
        message: "Report already exists",
      });
    }

    
    const report = await prisma.report.create({
      data: {
        appointment_id: Number(appointmentId),
        parameters,
        remarks,
        pathologistId,
        status: "DRAFT",
      },
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get report
export const getReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { report_id: Number(id) }, 
      include: {
        appointment: {
          include: {
            patient: true,
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//update report
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { parameters, remarks, status } = req.body;

    const report = await prisma.report.update({
      where: { report_id: Number(id) },
      data: {
        parameters,
        remarks,
        status,
      },
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};