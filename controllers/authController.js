const Usuario = require("../models/Usuario");

const authController = {
  // --- MUESTRA EL FORMULARIO DE LOGIN ---
  loginForm: (req, res) => {
    res.render("login", { titulo: "Iniciar Sesión", error: null });
  },

  // --- PROCESA EL LOGIN ---
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const usuario = await Usuario.findOne({ email });
      if (!usuario || !(await usuario.compararPassword(password))) {
        return res.render("login", {
          titulo: "Iniciar Sesión",
          error: "Correo o contraseña incorrectos",
        });
      }
      req.session.usuario = {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      };
      req.session.showRules = true;
      if (usuario.rol === "admin") {
        return res.redirect("/admin/dashboard");
      }
      res.redirect("/");
    } catch (error) {
      res.render("login", { titulo: "Iniciar Sesión", error: "Ocurrió un error" });
    }
  },

  // --- MUESTRA Y PROCESA EL REGISTRO ---
  registroForm: (req, res) => {
    res.render("registro", { titulo: "Crear Cuenta", error: null });
  },
  registrarUsuario: async (req, res) => {
    try {
      const { nombre, email, password, telefono } = req.body;
      if (await Usuario.findOne({ email })) {
        return res.render("registro", {
          titulo: "Crear Cuenta",
          error: "El correo electrónico ya está en uso.",
        });
      }
      const nuevoUsuario = new Usuario({ nombre, email, password, telefono });
      await nuevoUsuario.save();
      res.redirect("/auth/login");
    } catch (error) {
      res.render("registro", {
        titulo: "Crear Cuenta",
        error: "Ocurrió un error al crear la cuenta.",
      });
    }
  },

  // --- MARCA LAS REGLAS COMO VISTAS ---
  rulesSeen: (req, res) => {
    if (req.session) {
      req.session.showRules = false;
    }
    res.sendStatus(200);
  },
  
  // =============================================================
  // --- INICIO DE LA CORRECCIÓN PARA CERRAR SESIÓN ---
  // =============================================================
  logout: (req, res) => {
    // La función destroy() necesita un 'callback' para saber qué hacer cuando termina.
    req.session.destroy((err) => {
      // 1. Si ocurre un error al destruir la sesión, lo mostramos en consola.
      if (err) {
        console.error("Error al cerrar sesión:", err);
        // Aún así, debemos responder al navegador para que no se quede colgado.
        // Lo redirigimos a la página de inicio como medida de seguridad.
        return res.redirect('/'); 
      }
      
      // 2. Si todo sale bien (sin errores), la sesión se destruye
      //    y AHORA SÍ redirigimos al login.
      res.clearCookie('connect.sid'); // Limpia la cookie de sesión del navegador
      res.redirect("/auth/login");
    });
  },
  // =============================================================
  // --- FIN DE LA CORRECCIÓN ---
  // =============================================================
};

module.exports = authController;
