// controllers/usuarioController.js
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const { cloudinary } = require('../middlewares/upload');

const usuarioController = {
  // --- Vistas ---
  showMyProducts: async (req, res) => {
    try {
      const productos = await Producto.find({ vendedor: req.session.usuario.id });
      res.render('usuario/mis-productos', { productos });
    } catch (error) {
      console.error("Error al mostrar mis productos:", error);
      res.status(500).send("Error al cargar tus productos.");
    }
  },

  showCreateForm: (req, res) => {
    res.render('usuario/crear-producto');
  },

  showEditForm: async (req, res) => {
    try {
      const producto = await Producto.findOne({ _id: req.params.id, vendedor: req.session.usuario.id });
      if (!producto) return res.status(403).render('403', { titulo: 'Acceso denegado' });
      res.render('usuario/editar-producto', { producto });
    } catch (error) {
      console.error("Error al cargar producto para edición:", error);
      res.status(500).send("Error al cargar producto.");
    }
  },

  showProfileForm: (req, res) => {
    res.render('usuario/perfil', { usuario: req.session.usuario });
  },

  updateProfile: async (req, res) => {
    try {
      const { nombre, email } = req.body;
      await Usuario.findByIdAndUpdate(req.session.usuario.id, { nombre, email });
      res.redirect('/usuario/perfil');
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      res.status(500).send("Error al actualizar perfil.");
    }
  },

  // --- Crear producto: guarda secure_url (file.path) y public_id (filename) ---
  createProduct: async (req, res) => {
    try {
      const { nombre, descripcion, precio, categoria, stock } = req.body;

      const imagenes = (req.files || []).map(file => ({
        url: file.path,         // secure_url (URL pública de Cloudinary)
        filename: file.filename // public_id (para eliminar en Cloudinary)
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

  // --- Actualizar producto: elimina imagen antigua en Cloudinary si se actualiza ---
  updateProduct: async (req, res) => {
    try {
      const productoId = req.params.id;
      const productoActual = await Producto.findOne({ _id: productoId, vendedor: req.session.usuario.id });

      if (!productoActual) {
        return res.status(403).render('403', { titulo: 'Acceso denegado' });
      }

      const { nombre, descripcion, precio, categoria, stock } = req.body;
      const datosActualizados = { nombre, descripcion, precio, categoria, stock };

      // Si se subió una nueva imagen
      if (req.file) {
        // Eliminar la imagen anterior de Cloudinary
        const oldFilename = productoActual?.imagenes?.[0]?.filename;
        if (oldFilename && oldFilename !== 'default.png') {
          cloudinary.uploader.destroy(oldFilename, (error) => {
            if (error) console.error("Error al eliminar imagen anterior de Cloudinary:", error);
          });
        }

        // Nueva imagen
        const nuevaImagen = {
          url: req.file.path,
          filename: req.file.filename || req.file.public_id
        };

        // Reemplazar la primera imagen
        datosActualizados['imagenes.0'] = nuevaImagen;
      }

      await Producto.findByIdAndUpdate(productoId, { $set: datosActualizados });
      res.redirect('/usuario/productos');

    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      res.status(500).send('Error al actualizar el producto.');
    }
  },

  // --- Eliminar producto: borra todas las imágenes del producto en Cloudinary ---
  deleteProduct: async (req, res) => {
    try {
      const productoId = req.params.id;
      const producto = await Producto.findOneAndDelete({ _id: productoId, vendedor: req.session.usuario.id });

      if (!producto) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar este producto.' });
      }

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
};

module.exports = usuarioController;

