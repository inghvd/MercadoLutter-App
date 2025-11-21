const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mercadolutter";

let retries = 0;
const maxRetries = 5;

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✔️  MongoDB conectado");
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:", error.message);
    retries++;

    if (retries <= maxRetries) {
      console.log("Reintentando conexión... intento", retries, "de", maxRetries);
      setTimeout(connectDB, 3000);
    } else {
      console.log("❌ No se pudo conectar después de varios intentos.");
      process.exit(1);
    }
  }
}

connectDB();

module.exports = mongoose;

