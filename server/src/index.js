// We are using CommonJs module system in this file, so we use require() to import modules and module.exports to export them.

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
  });
});

// ✅ ROUTES FIRST
app.use("/api/reports", reportRoutes);
// app.use('/api/auth', authRoutes);

// ❗ THEN error handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server is running on http://localhost:${env.port}`);
});