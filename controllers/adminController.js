// controllers/adminController.js

const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const fs = require('fs');
const path = require('path');

// --- Helper para eliminar imágenes ---
const eliminarImagen = (filename) => {
  if (filename && filename !== 'default.png') {
    const imagePath = path.join(__dirname, '..', 'public', 'uploads', filename);
    // Usamos fs.unlink para no bloquear el proceso si hay un error
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Error al eliminar la imagen anterior:", err.message);
    });
  }
};

const adminController = {
  // Muestra el dashboard con estadísticas
  showDashboard: async (req, res) => {
    try {
      const totalProductos = await Producto.countDocuments();
      const totalUsuarios = await Usuario.countDocuments();
      res.render('admin/dashboard', {
        titulo: 'Dashboard Admin',
        usuario: req.session.usuario,
        totalProductos,
        totalUsuarios
      });
    } catch (error) {
      res.status(500).send('Error al cargar el dashboard');
    }
  },

  // Muestra la lista de todos los productos
  showProducts: async (req, res) => {
    try {
      const productos = await Producto.find({}).populate('vendedor', 'nombre email').sort({ createdAt: -1 });
      res.render('admin/gestionar-productos', {
        titulo: 'Gestionar Todos los Productos',
        productos
      });
    } catch (error) {
      res.status(500).send('Error al cargar los productos');
    }
  },

  // Muestra la lista de todos los usuarios
  showUsers: async (req, res) => {
    try {
      const usuarios = await Usuario.find({ _id: { $ne: req.session.usuario.id } }).sort({ createdAt: -1 });
      res.render('admin/gestionar-usuarios', {
        titulo: 'Gestionar Usuarios',
        usuarios
      });
    } catch (error) {
      res.status(500).send('Error al cargar los usuarios');
    }
  },

  // Muestra el formulario para editar un producto
  showEditForm: async (req, res) => {
    try {
      const producto = await Producto.findById(req.params.id);
      if (!producto) return res.redirect('/admin/productos');
      res.render('admin/editar-producto', {
        titulo: 'Editar Producto',
        producto,
        error: null
      });
    } catch (error) {
      res.redirect('/admin/productos');
    }
  },
  
  // ===================================================================
  // --- FUNCIÓN CORREGIDA Y FUNCIONAL ---
  // ===================================================================
  updateProduct: async (req, res) => {
  //----- COMIENZA EL CÓDIGO DEL "CHISMOSO" -----
console.log("-----------------------------------------");
console.log("Alguien está intentando guardar un producto.");
console.log("Los datos de texto que llegaron son:", req.body);
console.log("La información de la foto es:", req.file);
console.log("-----------------------------------------");
//----- TERMINA EL CÓDIGO DEL "CHISMOSO" -----
    try {
      const productoId = req.params.id;
      const { nombre, descripcion, precio, categoria, stock } = req.body;

      // 1. Preparamos un objeto con los datos de texto a actualizar
      const datosActualizados = {
        nombre,
        descripcion,
        precio,
        categoria,
        stock
      };

      // 2. Verificamos si se subió una nueva imagen
      if (req.file) {
        // Buscamos el producto actual para obtener el nombre de la imagen vieja y borrarla
        const productoActual = await Producto.findById(productoId);
        if (productoActual) {
          eliminarImagen(productoActual.imagen);
        }
        
        // Añadimos el nombre de la NUEVA imagen a nuestro objeto de actualización
        datosActualizados.imagen = req.file.filename;
      }

      // 3. Actualizamos el producto en la base de datos con todos los datos
      await Producto.findByIdAndUpdate(productoId, datosActualizados);
      
      // 4. Redirigimos al usuario a la lista de productos
      res.redirect('/admin/productos');

    } catch (error) {
        console.error("Error al actualizar producto desde admin:", error);
        // Si hay un error, es mejor enviar un mensaje que solo redirigir
        res.status(500).send('Ocurrió un error al actualizar el producto.');
    }
  },
  
  // Elimina un producto (tu función ya era correcta, la mantenemos)
  deleteProduct: async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (producto) {
            eliminarImagen(producto.imagen);
            await Producto.findByIdAndDelete(req.params.id);
        }
        res.redirect('/admin/productos');
    } catch (error) {
        res.redirect('/admin/productos');
    }
  },

  // Muestra el formulario para editar a OTRO usuario
  showUserEditForm: async (req, res) => {
    try {
      const usuario = await Usuario.findById(req.params.id);
      if (!usuario) {
        return res.redirect('/admin/usuarios');
      }
      res.render('admin/editar-usuario', {
        titulo: `Editando a ${usuario.nombre}`,
        usuario
      });
    } catch (error) {
      res.redirect('/admin/usuarios');
    }
  },

  // Procesa la actualización de OTRO usuario por parte del admin
  updateUser: async (req, res) => {
    try {
      const { nombre, telefono, rol } = req.body;
      await Usuario.findByIdAndUpdate(req.params.id, {
        nombre,
        telefono,
        rol
      });
      res.redirect('/admin/usuarios');
    } catch (error) {
      res.redirect('/admin/usuarios');
    }
  }
};

module.exports = adminController;
