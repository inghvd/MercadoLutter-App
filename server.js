require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const helmet = require("helmet");
const { mongoose } = require("./db");

const app = express();
const PORT = process.env.PORT || 3033;

// ====== VISTAS ======
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ====== MIDDLEWARES ======
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ====== HELMET CORREGIDO FINALMENTE: Permite scripts en botones y Cloudinary ======
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Scripts en <script src="..."> (Bootstrap, etc.)
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        // CRÍTICO: Permite scripts en atributos de elementos (como el onclick="return confirm(...)")
        scriptSrcAttr: ["'unsafe-inline'"], 
        // Permite scripts inline dentro de etiquetas <script>
        scriptSrcElem: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"], 
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com/demjmyttl/", "https:"], 
        fontSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
        connectSrc: ["'self'"],
      },
    },
    // Deshabilitar políticas de origen cruzado para Multer/Cloudinary
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ====== SESIÓN ======
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);

// ====== VARIABLES LOCALES ======
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.showRules = req.session.showRules || false;
  next();
});

// ====== RUTAS ======
const productoRoutes = require("./routes/productoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");

app.use("/", productoRoutes);
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/usuario", usuarioRoutes);

// ====== 404 ======
app.use((req, res) => {
  res.status(404).render("404", { titulo: "Página no encontrada" });
});

// ====== SERVIDOR ======
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
