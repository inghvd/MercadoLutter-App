// models/Producto.js (VERSIÓN CORREGIDA Y FUNCIONAL)

const mongoose = require("mongoose");

// Subdocumento para imágenes (Cloudinary)
const ImagenSchema = new mongoose.Schema({
  url: { type: String, required: true },      // secure_url → URL pública de Cloudinary
  filename: { type: String, required: true }, // public_id → para eliminar en Cloudinary
});

// Esquema principal de Producto
const ProductoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true },
    categoria: { type: String, required: true },
    stock: { type: Number, default: 1 },

    // Relación con el usuario vendedor
    vendedor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Usuario", 
      required: true 
    },

    // Array de imágenes (cada una con url y filename)
    imagenes: [ImagenSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Producto", ProductoSchema);
