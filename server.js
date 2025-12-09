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

// ====== HELMET CONFIGURADO PARA QUE TODO FUNCIONE Y SE VEA BONITO ======
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"], // Bootstrap, etc.
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:", "http:"], // Cloudinary + favicon
        fontSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
        connectSrc: ["'self'"],
      },
    },
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
