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
    console.error("Error al cargar el catálogo:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// Ruta para el detalle de un producto en /producto/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render('404', { titulo: 'Producto no encontrado' });
    }

    // Buscar el producto y traer datos del vendedor
    const producto = await Producto.findById(id)
                                   .populate('vendedor', 'nombre telefono');

    if (!producto) {
      return res.status(404).render('404', { titulo: 'Producto no encontrado' });
    }

    // Renderizar la vista detalleProducto con el producto
    res.render('detalleProducto', {
      producto,
      titulo: producto.nombre
    });
  } catch (error) {
    console.error("Error al obtener el detalle del producto:", error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;

