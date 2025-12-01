// Carga las variables de entorno del archivo .env
require("dotenv").config();

// Importa mongoose para la conexión y el modelo de Usuario
const mongoose = require("mongoose");
const Usuario = require("./models/Usuario");

// --- CONFIGURACIÓN ---
// Define aquí los datos del administrador que quieres crear
const ADMIN_EMAIL = "admin@mercadolutter.com";
const ADMIN_PASSWORD = "Admin123"; // Cambia esto por una contraseña segura
const ADMIN_NOMBRE = "Administrador";
// --------------------

const dbConnect = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mercadolutter";
    await mongoose.connect(MONGO_URI);
    console.log("✔️  MongoDB conectado para crear admin.");
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:", error.message);
    process.exit(1); // Si no se puede conectar, termina el script
  }
};

const createAdmin = async () => {
  try {
    // 1. Conectar a la base de datos
    await dbConnect();

    // 2. Verificar si el administrador ya existe
    const adminExistente = await Usuario.findOne({ email: ADMIN_EMAIL });
    if (adminExistente) {
      console.log(`⚠️  El usuario administrador con el email '${ADMIN_EMAIL}' ya existe.`);
      mongoose.connection.close();
      return;
    }

    // 3. Crear la nueva instancia del usuario administrador
    const nuevoAdmin = new Usuario({
      nombre: ADMIN_NOMBRE,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      rol: "admin",
    });

    // 4. Guardar el usuario. Esto activará el hook .pre('save') para encriptar la contraseña
    await nuevoAdmin.save();
    console.log("✅ ¡Usuario administrador creado exitosamente!");

  } catch (error) {
    console.error("❌ Error al crear el usuario administrador:", error);
  } finally {
    // 5. Cerrar la conexión a la base de datos
    mongoose.connection.close();
    console.log("🔌 Conexión con MongoDB cerrada.");
  }
};

// Ejecutar la función
createAdmin();
