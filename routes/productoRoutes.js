const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Producto = require('../models/Producto');

// Ruta del catálogo (muestra todos los productos)
router.get(['/', '/productos', '/catalogo'], async (req, res) => {
  try {
    const productos = await Producto.find({}).sort({ createdAt: -1 });
    res.render('catalogo', {
      productos,
      total: productos.length,
      titulo: "Catálogo de Productos"
    });
  } catch (error) {
    res.status(500).send("Error interno del servidor");
  }
});

// Ruta para el detalle de un producto
router.get('/producto/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).render('404', { titulo: 'Producto no encontrado' });
    }
    
    // --- CAMBIO CLAVE ---
    // Al buscar el producto, usamos .populate() para traer también los datos del vendedor.
    const producto = await Producto.findById(req.params.id)
                                   .populate('vendedor', 'nombre telefono'); // Traemos nombre y teléfono del vendedor

    if (!producto) {
      return res.status(404).render('404', { titulo: 'Producto no encontrado' });
    }
    
    // Ya no necesitamos pasar el whatsappNumber global, porque ahora viene en el objeto 'producto'
    res.render('detalleProducto', { 
      producto: producto,
      titulo: producto.nombre
    });
  } catch (error) {
    console.error("Error al obtener el detalle del producto:", error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
