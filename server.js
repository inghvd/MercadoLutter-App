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

// Conexión a MongoDB
connectDB();

// ====== VISTAS ======
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ====== MIDDLEWARES ======
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ====== HELMET ======
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        scriptSrcAttr: ["'unsafe-inline'"],
        scriptSrcElem: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com/demjmyttl/", "https:"],
        fontSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ====== SESIÓN ======
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secreto",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 día
  })
);

// ====== RUTAS ======
// Ejemplo de montaje de rutas
const usuarioRoutes = require("./routes/usuarioRoutes");
app.use("/usuario", usuarioRoutes);

// ====== 404 ======
app.use((req, res) => {
  res.status(404).render("404");
});

// ====== SERVIDOR ======
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
