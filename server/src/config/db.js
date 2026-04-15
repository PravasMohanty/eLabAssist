const dotenv = require("dotenv");
dotenv.config(); 

const { PrismaClient } = require("@prisma/client");
console.log("DB URL inside db.js:", process.env.DATABASE_URL);

const prisma = new PrismaClient();
module.exports = { prisma };