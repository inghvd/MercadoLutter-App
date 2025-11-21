const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UsuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // --- CAMPO NUEVO AÑADIDO ---
    telefono: { type: String, required: true },
    
    rol: { type: String, enum: ["admin", "cliente"], default: "cliente" },
  },
  { timestamps: true }
);

// Encriptar contraseña antes de guardar
UsuarioSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Método para comparar contraseñas
UsuarioSchema.methods.compararPassword = async function (passwordPlano) {
  return await bcrypt.compare(passwordPlano, this.password);
};

module.exports = mongoose.model("Usuario", UsuarioSchema);
