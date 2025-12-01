require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const { mongoose } = require("./db");

const app = express();

const PORT = process.env.PORT || 3033;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    },
  })
);

app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.showRules = req.session.showRules || false;
  next();
});

// --- RUTAS ---
const productoRoutes = require("./routes/productoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes"); // <-- LÍNEA AÑADIDA

app.use("/", productoRoutes);
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/usuario", usuarioRoutes); // <-- LÍNEA AÑADIDA

// MANEJO DE ERRORES 404
app.use((req, res) => {
  res.status(404).render("404", { titulo: "Página no encontrada" });
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log("✔️ Servidor ejecutándose en http://localhost:" + PORT);
});
