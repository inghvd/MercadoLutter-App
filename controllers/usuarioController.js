// controllers/usuarioController.js

const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const fs = require('fs');
const path = require('path');

// --- Función Auxiliar para eliminar imágenes del servidor ---
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

  // Muestra la página con los productos que ha publicado el usuario
  showMyProducts: async (req, res) => {
    try {
      // Busca en la base de datos todos los productos cuyo 'vendedor' coincida con el ID del usuario logueado
      const productos = await Producto.find({ vendedor: req.session.usuario.id }).sort({ createdAt: -1 });
      res.render('usuario/mis-productos', {
        titulo: 'Mis Productos',
        productos
      });
    } catch (error) {
      res.status(500).send('Error al cargar tus productos');
    }
  },

  // Muestra el formulario para publicar un nuevo producto
  showCreateForm: (req, res) => {
    res.render('usuario/crear-producto', {
      titulo: 'Publicar Nuevo Producto'
    });
  },

  // ======================================================================
  // --- FUNCIÓN CLAVE PARA PUBLICAR PRODUCTOS ---
  // ======================================================================
  // Procesa los datos del formulario y crea el nuevo producto en la BD
  createProduct: async (req, res) => {
    try {
      // 1. Obtenemos los datos de texto del formulario (req.body)
      const { nombre, descripcion, precio, categoria, stock } = req.body;
      
      // 2. Creamos un nuevo objeto 'Producto' con esos datos
      const nuevoProducto = new Producto({
        nombre,
        descripcion,
        precio,
        categoria,
        stock,
        // 3. Si se subió una foto (req.file existe), usamos su nombre. Si no, se usa 'default.png'
        imagen: req.file ? req.file.filename : 'default.png',
        // 4. Asignamos el ID del usuario logueado como el vendedor del producto
        vendedor: req.session.usuario.id
      });

      // 5. Guardamos el nuevo producto en la base de datos
      await nuevoProducto.save();
      
      // 6. Redirigimos al usuario a su lista de productos para que vea el nuevo artículo
      res.redirect('/usuario/productos');

    } catch (error) {
      console.error("Error al crear el producto:", error);
      res.status(500).send('Ocurrió un error al publicar tu producto.');
    }
  },

  // Muestra el formulario para editar un producto existente
  showEditForm: async (req, res) => {
    try {
      // Busca un producto que tenga el ID de la URL y que además pertenezca al usuario logueado
      const producto = await Producto.findOne({ _id: req.params.id, vendedor: req.session.usuario.id });

      // Si no se encuentra el producto (o no le pertenece), se deniega el acceso
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

  // Procesa los datos del formulario de edición y actualiza el producto en la BD
  updateProduct: async (req, res) => {
    try {
      const productoId = req.params.id;
      // Primero, nos aseguramos de que el producto le pertenece al usuario
      const productoActual = await Producto.findOne({ _id: productoId, vendedor: req.session.usuario.id });

      if (!productoActual) {
        return res.status(403).render('403', { titulo: 'Acceso denegado' });
      }

      const { nombre, descripcion, precio, categoria, stock } = req.body;
      const datosActualizados = { nombre, descripcion, precio, categoria, stock };

      // Si el usuario subió una foto nueva...
      if (req.file) {
        // ...añadimos el nuevo nombre de la foto a los datos a actualizar...
        datosActualizados.imagen = req.file.filename;
        // ...y eliminamos la foto antigua del servidor para no acumular basura.
        eliminarImagen(productoActual.imagen);
      }

      await Producto.findByIdAndUpdate(productoId, datosActualizados);
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
        // Buscamos y eliminamos el producto en un solo paso, asegurándonos de que le pertenece al usuario
        const producto = await Producto.findOneAndDelete({ _id: productoId, vendedor: req.session.usuario.id });

        if (!producto) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este producto.' });
        }

        // Si el producto existía y fue eliminado, también eliminamos su imagen asociada.
        eliminarImagen(producto.imagen);

        res.status(200).json({ message: 'Producto eliminado correctamente.' });
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        res.status(500).json({ message: 'Error al eliminar el producto.' });
    }
  },
  
  // Muestra el formulario para editar el perfil del propio usuario
  showProfileForm: async (req, res) => {
    try {
      // Busca los datos del usuario logueado para rellenar el formulario
      const usuario = await Usuario.findById(req.session.usuario.id);
      res.render('usuario/perfil', {
        titulo: 'Editar mi Perfil',
        usuario
      });
    } catch (error) {
      res.status(500).send('Error al cargar tu perfil.');
    }
  },
  
  // Procesa los datos y actualiza el perfil del usuario en la BD
  updateProfile: async (req, res) => {
    try {
      const { nombre, telefono } = req.body;
      const usuarioActualizado = await Usuario.findByIdAndUpdate(req.session.usuario.id, { nombre, telefono }, { new: true });
      
      // Actualizamos también los datos guardados en la sesión para que se reflejen en toda la web
      req.session.usuario = {
        id: usuarioActualizado._id,
        nombre: usuarioActualizado.nombre,
        rol: usuarioActualizado.rol
      };

      res.redirect('/usuario/perfil'); // Redirigimos de vuelta al perfil
    } catch (error) {
      res.status(500).send('Error al actualizar tu perfil.');
    }
  },
};

module.exports = usuarioController;
