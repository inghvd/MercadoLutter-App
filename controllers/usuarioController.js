// controllers/usuarioController.js (CÓDIGO CORREGIDO)

const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const fs = require('fs');
const path = require('path');
// Importar Cloudinary SDK: Asumimos que lo exportas desde 'upload.js'
const { cloudinary } = require('../middlewares/upload'); // <--- AÑADIDO: Importar Cloudinary SDK para borrar

// --- FUNCIÓN AUXILIAR (ELIMINADA) ---
// const eliminarImagen = (filename) => { ... } // <--- ELIMINADA: Ya no es necesaria, es código local obsoleto.

const usuarioController = {
// ... (Funciones showMyProducts, showCreateForm, createProduct, showEditForm sin cambios)

// ======================================================================
// --- updateProduct: AÑADIDA LÓGICA DE ELIMINACIÓN DE CLOUDINARY ---
// ======================================================================
  updateProduct: async (req, res) => {
    try {
      const productoId = req.params.id;
      const productoActual = await Producto.findOne({ _id: productoId, vendedor: req.session.usuario.id });

      if (!productoActual) {
        return res.status(403).render('403', { titulo: 'Acceso denegado' });
      }

      const { nombre, descripcion, precio, categoria, stock } = req.body;
      const datosActualizados = { nombre, descripcion, precio, categoria, stock };

      // Si el usuario subió una foto nueva (req.file existe, singular)...
      if (req.file) {
        // 1. ELIMINAR LA IMAGEN ANTIGUA DE CLOUDINARY
        const oldFilename = productoActual.imagenes[0].filename;
        if (oldFilename && oldFilename !== 'default.png') {
          cloudinary.uploader.destroy(oldFilename, (error, result) => {
            if (error) console.error("Error al eliminar imagen anterior de Cloudinary:", error);
          });
        }

        // 2. CREAMOS EL OBJETO DE IMAGEN NUEVA PARA EL ARRAY
        const nuevaImagen = {
          url: req.file.path, 
          filename: req.file.filename || req.file.public_id
        };
        // 3. Reemplazamos la primera imagen del array 'imagenes'
        datosActualizados['imagenes.0'] = nuevaImagen; 
      }

      // Usamos $set para actualizar el campo del array (si existe req.file)
      await Producto.findByIdAndUpdate(productoId, { $set: datosActualizados });
      res.redirect('/usuario/productos');

    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      res.status(500).send('Error al actualizar el producto.');
    }
  },

// ======================================================================
// --- deleteProduct: AÑADIDA LÓGICA DE ELIMINACIÓN DE CLOUDINARY ---
// ======================================================================
  deleteProduct: async (req, res) => {
    try {
        const productoId = req.params.id;
        const producto = await Producto.findOneAndDelete({ _id: productoId, vendedor: req.session.usuario.id });

        if (!producto) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este producto.' });
        }

        // Eliminamos las imágenes de Cloudinary usando su public_id (filename)
        if (producto.imagenes && producto.imagenes.length > 0) {
            for (let img of producto.imagenes) {
                if (img.filename && img.filename !== 'default.png') {
                    cloudinary.uploader.destroy(img.filename, (error, result) => {
                        if (error) console.error("Error al eliminar imagen de Cloudinary:", error);
                    });
                }
            }
        }

        res.status(200).json({ message: 'Producto eliminado correctamente.' });
    } catch (error) {
// ...
