// controllers/usuarioController.js (VERSIÓN CORREGIDA Y FUNCIONAL)

const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const fs = require('fs');
const path = require('path');
// Importar Cloudinary SDK desde el middleware de subida
const { cloudinary } = require('../middlewares/upload');

const usuarioController = {
  // --------------------------------------------------------------------
  // Mantén tus funciones existentes (showMyProducts, showCreateForm, etc.)
  // --------------------------------------------------------------------

  // ======================================================================
  // --- createProduct: GUARDA secure_url (file.path) y public_id (filename)
  // ======================================================================
  createProduct: async (req, res) => {
    try {
      const { nombre, descripcion, precio, categoria, stock } = req.body;

      // Si configuraste upload.array('imagenes', 10), req.files contiene las imágenes
      const imagenes = (req.files || []).map(file => ({
        url: file.path,         // secure_url → URL pública de Cloudinary
        filename: file.filename // public_id → para eliminar en Cloudinary
      }));

      const nuevoProducto = new Producto({
        nombre,
        descripcion,
        precio,
        categoria,
        stock,
        vendedor: req.session.usuario.id,
        imagenes
      });

      await nuevoProducto.save();
      res.redirect('/usuario/productos');
    } catch (error) {
      console.error("Error al crear producto:", error);
      res.status(500).send('Error al crear producto.');
    }
  },

  // ======================================================================
  // --- updateProduct: ELIMINA IMAGEN ANTIGUA EN CLOUDINARY SI SE ACTUALIZA
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
        // 1. ELIMINAR LA IMAGEN ANTIGUA DE CLOUDINARY (si existe)
        const oldFilename = productoActual?.imagenes?.[0]?.filename;
        if (oldFilename && oldFilename !== 'default.png') {
          cloudinary.uploader.destroy(oldFilename, (error) => {
            if (error) console.error("Error al eliminar imagen anterior de Cloudinary:", error);
          });
        }

        // 2. NUEVA IMAGEN (URL pública y public_id)
        const nuevaImagen = {
          url: req.file.path,                      // secure_url
          filename: req.file.filename || req.file.public_id // public_id
        };

        // 3. Reemplazar la primera imagen del array 'imagenes'
        datosActualizados['imagenes.0'] = nuevaImagen;
      }

      // Actualizar datos (y la primera imagen si corresponde)
      await Producto.findByIdAndUpdate(productoId, { $set: datosActualizados });
      res.redirect('/usuario/productos');

    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      res.status(500).send('Error al actualizar el producto.');
    }
  },

  // ======================================================================
  // --- deleteProduct: ELIMINA TODAS LAS IMÁGENES DEL PRODUCTO EN CLOUDINARY
  // ======================================================================
  deleteProduct: async (req, res) => {
    try {
      const productoId = req.params.id;
      const producto = await Producto.findOneAndDelete({ _id: productoId, vendedor: req.session.usuario.id });

      if (!producto) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar este producto.' });
      }

      // Eliminar imágenes de Cloudinary (usando su public_id -> filename)
      if (producto.imagenes && producto.imagenes.length > 0) {
        for (let img of producto.imagenes) {
          if (img.filename && img.filename !== 'default.png') {
            cloudinary.uploader.destroy(img.filename, (error) => {
              if (error) console.error("Error al eliminar imagen de Cloudinary:", error);
            });
          }
        }
      }

      res.status(200).json({ message: 'Producto eliminado correctamente.' });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      res.status(500).send('Error al eliminar producto.');
    }
  },

  // --------------------------------------------------------------------
  // Mantén tus otras funciones: showMyProducts, showCreateForm, showEditForm,
  // showProfileForm, updateProfile, etc. sin cambios.
  // --------------------------------------------------------------------
};

module.exports = usuarioController;
