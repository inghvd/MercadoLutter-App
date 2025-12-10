// controllers/usuarioController.js

const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const fs = require('fs');
const path = require('path');
// Importar Cloudinary SDK para poder borrar imágenes, ya que fs.unlink no funciona con Cloudinary.
// const { cloudinary } = require('../middlewares/cloudinary'); // Asumiendo que exportaste la instancia de Cloudinary

// --- FUNCIÓN AUXILIAR (ATENCIÓN: ESTA FUNCIÓN ES PARA ALMACENAMIENTO LOCAL) ---
// Si estás usando Cloudinary, la lógica de eliminación DEBE usar el SDK de Cloudinary
// y el public_id (filename), no fs.unlink. Por ahora la dejamos como estaba.
const eliminarImagen = (filename) => {
  // Nos aseguramos de no borrar la imagen por defecto
  if (filename && filename !== 'default.png') {
    const imagePath = path.join(__dirname, '..', 'public', 'uploads', filename);
    // fs.unlink borra el archivo. Se ejecuta en segundo plano para no frenar la app.
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Error al intentar eliminar la imagen:", err.message);
    });
  }
};

const usuarioController = {

  showMyProducts: async (req, res) => {
    try {
      const productos = await Producto.find({ vendedor: req.session.usuario.id }).sort({ createdAt: -1 });
      res.render('usuario/mis-productos', {
        titulo: 'Mis Productos',
        productos
      });
    } catch (error) {
      res.status(500).send('Error al cargar tus productos');
    }
  },

  showCreateForm: (req, res) => {
    res.render('usuario/crear-producto', {
      titulo: 'Publicar Nuevo Producto'
    });
  },

  // ======================================================================
  // --- FUNCIÓN CORREGIDA: MANEJA MÚLTIPLES ARCHIVOS (req.files) ---
  // ======================================================================
  createProduct: async (req, res) => {
    try {
      const { nombre, descripcion, precio, categoria, stock } = req.body;
      
      // Mapeamos el array de archivos subidos por Multer-Cloudinary (req.files)
      // Esto crea un array de objetos con la URL y el nombre/ID público.
      const imagenesSubidas = req.files.map(file => ({
        url: file.path, // URL generada por Cloudinary
        filename: file.filename || file.public_id // ID público de Cloudinary
      }));

      // Si no se subió ninguna imagen, se usa la imagen por defecto.
      if (imagenesSubidas.length === 0) {
        imagenesSubidas.push({ 
          url: '/uploads/default.png', // Ruta para el front-end
          filename: 'default.png'
        }); 
      }
      
      const nuevoProducto = new Producto({
        nombre,
        descripcion,
        precio,
        categoria,
        stock,
        // Asignamos el array de imágenes al campo 'imagenes'
        imagenes: imagenesSubidas,
        vendedor: req.session.usuario.id
      });

      await nuevoProducto.save();
      
      res.redirect('/usuario/productos');

    } catch (error) {
      console.error("Error al crear el producto:", error);
      // Si hubo un error después de la subida, es buena práctica borrar las imágenes
      // que ya se subieron a Cloudinary para evitar basura. Esto requeriría el SDK.
      res.status(500).send('Ocurrió un error al publicar tu producto.');
    }
  },

  // Muestra el formulario para editar un producto existente
  showEditForm: async (req, res) => {
    try {
      const producto = await Producto.findOne({ _id: req.params.id, vendedor: req.session.usuario.id });

      if (!producto) {
        return res.status(403).render('403', { titulo: 'Acceso denegado' });
      }

      res.render('usuario/editar-producto', {
        titulo: `Editando: ${producto.nombre}`,
        producto
      });
    } catch (error) {
      res.status(500).send('Error al cargar el producto para editar');
    }
  },

  // ======================================================================
  // --- FUNCIÓN CORREGIDA: MANEJA EL REEMPLAZO DE LA IMAGEN PRINCIPAL ---
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
        // CREAMOS EL OBJETO DE IMAGEN PARA EL ARRAY
        const nuevaImagen = {
          url: req.file.path, 
          filename: req.file.filename || req.file.public_id
        };

        // Lógica para reemplazar la primera imagen del array (main image)
        // 1. Opcional: Eliminar la imagen antigua de Cloudinary (requiere el SDK).
        // 2. Reemplazamos la primera imagen del array 'imagenes'
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

  // Elimina un producto de la BD y su foto del servidor
  deleteProduct: async (req, res) => {
    try {
        const productoId = req.params.id;
        const producto = await Producto.findOneAndDelete({ _id: productoId, vendedor: req.session.usuario.id });

        if (!producto) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este producto.' });
        }

        // RECOMENDACIÓN: Aquí deberías iterar sobre producto.imagenes
        // y llamar a la función de eliminación de Cloudinary para cada una.
        

        res.status(200).json({ message: 'Producto eliminado correctamente.' });
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).json({ message: 'Error al eliminar el producto.' });
    }
  },
  
  // ... (Resto del código de perfil sin cambios)
};

module.exports = usuarioController;
