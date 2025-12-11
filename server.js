require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const helmet = require("helmet");
const { mongoose, connectDB } = require("./db");

const app = express();
const PORT = process.env.PORT || 3033;
const NODE_ENV = process.env.NODE_ENV || "development";

// Conexión a MongoDB (usa el connectDB exportado desde ./db)
connectDB();

// Vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Static (sirve assets como /public/images/default.png, CSS, JS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Helmet (CSP incluyendo Cloudinary)
// Nota: Si cambias el cloud_name, actualiza la URL de res.cloudinary.com/<cloud_name> aquí.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        scriptSrcAttr: ["'unsafe-inline'"],
        scriptSrcElem: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: [
          "'self'",
          "data:",
          "https://res.cloudinary.com/demjmyttl/",
          "https:"
        ],
        fontSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
        connectSrc: ["'self'", "https:"],
      },
    },
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Render y proxies: asegura cookies confiables detrás de proxy
app.set("trust proxy", 1);

// Sesión (usa MongoStore con tu MONGO_URI)
// En producción (Render), marca la cookie como secure.
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secreto",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mercadolutter",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 día
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
    },
    name: "ml_session",
  })
);

// Variables locales mínimas
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

// Rutas
const usuarioRoutes = require("./routes/usuarioRoutes");
const productoRoutes = require("./routes/productoRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/usuario", usuarioRoutes);
app.use("/producto", productoRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

// Healthcheck opcional (útil para Render)
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, env: NODE_ENV, db: mongoose.connection.readyState });
});

// 404
app.use((req, res) => {
  res.status(404).render("404");
});

// Error handler (para que no crashee con errores no capturados de rutas)
app.use((err, req, res, next) => {
  console.error("Error no controlado:", err);
  res.status(500).send("Error interno del servidor.");
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

