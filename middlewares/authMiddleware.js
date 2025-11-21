module.exports = {
  esAdmin: (req, res, next) => {
    if (!req.session.usuario || req.session.usuario.rol !== "admin") {
      return res.redirect("/auth/login");
    }
    next();
  },

  estaLogueado: (req, res, next) => {
    if (!req.session.usuario) {
      return res.redirect("/auth/login");
    }
    next();
  }
};

