
const supabase = require("../utils/supabase");

const getDashboardOverview = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    //  Patients created today
    const { count: todayPatients } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today);

    //  Total appointments
    const { count: totalAppointments } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true });

    //  Pending appointments
    const { count: pendingAppointments } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    //  Pending lab results (reports not completed)
    const { count: pendingLabResults } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .neq("status", "completed");

    //  Today's income
    const { data: bills } = await supabase
      .from("bills")
      .select("total_amount, created_at")
      .gte("created_at", today);

    const dailyCollection = bills.reduce((sum, b) => {
      return sum + (b.total_amount || 0);
    }, 0);
    
    //  Pending collection (optional)
    const pendingCollection = 0;

    res.json({
      todayPatients: todayPatients || 0,
      totalAppointments: totalAppointments || 0,
      pendingAppointments: pendingAppointments || 0,
      pendingLabResults: pendingLabResults || 0,
      dailyCollection,
      pendingCollection
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecentAppointments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        appointment_code,
        appointment_time,
        status,
        patients (name),
        users (name)
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    const formatted = data.map((appt) => ({
      appointmentId: appt.appointment_code,
      time: appt.appointment_time,
      patientName: appt.patients?.name,
      doctorName: appt.users?.name,
      status: appt.status
    }));

    res.json(formatted);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingLabs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select(`
        report_code,
        priority,
        patients (name),
        tests (name)
      `)
      .eq("status", "pending")
      .limit(5);

    if (error) throw error;

    const formatted = data.map((lab) => ({
      requestId: lab.report_code,
      patientName: lab.patients?.name,
      tests: lab.tests?.name,
      priority: lab.priority
    }));

    res.json(formatted);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  
  getDashboardOverview,
  getRecentAppointments,
  getPendingLabs
};