const mongoose = require("mongoose");

const ProductoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true },
    categoria: { type: String, required: true },
    imagen: { type: String, default: "default.png" },
    stock: { type: Number, default: 1 },
    
    // --- CAMBIO IMPORTANTE ---
    // Añadimos una referencia para saber qué usuario es el vendedor.
    vendedor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Usuario', // 'Usuario' es el nombre de tu modelo de usuarios
      required: true 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Producto", ProductoSchema);
