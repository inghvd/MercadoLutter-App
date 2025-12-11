const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const { cloudinary } = require('../middlewares/upload');

const usuarioController = {
  // Mostrar productos del usuario
  showMyProducts: async (req, res) => {
    try {
      const productos = await Producto.find({ vendedor: req.session.usuario.id });
      res.render('usuario/mis-productos', { productos });
    } catch (error) {
      console.error("Error al mostrar mis productos:", error);
      res.status(500).send("Error al cargar tus productos.");
    }
  },

  // Formulario crear producto
  showCreateForm: (req, res) => {
    res.render('usuario/crear-producto');
  },

  // Formulario editar producto
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

  // Perfil
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

  // Crear producto
  createProduct: async (req, res) => {
    try {
      const { nombre, descripcion, precio, categoria, stock } = req.body;
      const imagenes = (req.files || []).map(file => ({
        url: file.path,
        filename: file.filename
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

  // Actualizar producto
  updateProduct: async (req, res) => {
    try {
      const productoId = req.params.id;
      const productoActual = await Producto.findOne({ _id: productoId, vendedor: req.session.usuario.id });
      if (!productoActual) return res.status(403).render('403', { titulo: 'Acceso denegado' });

      const { nombre, descripcion, precio, categoria, stock } = req.body;
      const datosActualizados = { nombre, descripcion, precio, categoria, stock };

      if (req.file) {
        const oldFilename = productoActual?.imagenes?.[0]?.filename;
        if (oldFilename && oldFilename !== 'default.png') {
          cloudinary.uploader.destroy(oldFilename, (error) => {
            if (error) console.error("Error al eliminar imagen anterior:", error);
          });
        }
        datosActualizados['imagenes.0'] = {
          url: req.file.path,
          filename: req.file.filename || req.file.public_id
        };
      }

      await Producto.findByIdAndUpdate(productoId, { $set: datosActualizados });
      res.redirect('/usuario/productos');
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      res.status(500).send('Error al actualizar producto.');
    }
  },

  // Eliminar producto
  deleteProduct: async (req, res) => {
    try {
      const productoId = req.params.id;
      const producto = await Producto.findOneAndDelete({ _id: productoId, vendedor: req.session.usuario.id });
      if (!producto) return res.status(403).json({ message: 'No tienes permiso para eliminar este producto.' });

      if (producto.imagenes && producto.imagenes.length > 0) {
        for (let img of producto.imagenes) {
          if (img.filename && img.filename !== 'default.png') {
            cloudinary.uploader.destroy(img.filename, (error) => {
              if (error) console.error("Error al eliminar imagen:", error);
            });
          }
        }
      }

      res.status(200).json({ message: 'Producto eliminado correctamente.' });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      res.status(500).send('Error al eliminar producto.');
    }
  }
};

module.exports = usuarioController;

