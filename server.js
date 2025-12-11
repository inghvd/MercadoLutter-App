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

// Conexión a MongoDB
connectDB();

// Vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Helmet (CSP incluyendo Cloudinary)
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

app.set("trust proxy", 1);

// Sesión
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

// Variables locales
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

// Ruta raíz (evita 404 en /)
app.get("/", (req, res) => {
  res.redirect("/producto/catalogo");
});

// Healthcheck
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, env: NODE_ENV, db: mongoose.connection.readyState });
});

// 404
app.use((req, res) => {
  res.status(404).render("404");
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error no controlado:", err);
  res.status(500).send("Error interno del servidor.");
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

