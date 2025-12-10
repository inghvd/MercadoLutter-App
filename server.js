// server.js (CÓDIGO CORREGIDO)
require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const helmet = require("helmet");
// const favicon = require("serve-favicon"); // <-- IMPORTACIÓN COMENTADA
const { mongoose } = require("./db");

const app = express();
const PORT = process.env.PORT || 3033;

// RUTA DEL FAVICON (asume que está en 'public/favicon.ico')
// const faviconPath = path.join(__dirname, 'public', 'favicon.ico'); 

// ====== VISTAS ======
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ====== MIDDLEWARES ======
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// USAR EL MIDDLEWARE DE FAVICON AQUÍ
// app.use(favicon(faviconPath)); // <-- COMENTADO PARA EVITAR ERROR ENOENT

app.use(express.static(path.join(__dirname, "public")));

// ====== HELMET CORREGIDO FINALMENTE: Permite scripts en botones y Cloudinary ======
// (El código de Helmet aquí es correcto y se mantiene)
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
// ... (código de sesión sin cambios)
);

// ====== VARIABLES LOCALES ======
// ... (código de variables locales sin cambios)

// ====== RUTAS ======
// ... (código de rutas sin cambios)

// ====== 404 ======
// ... (código de 404 sin cambios)

// ====== SERVIDOR ======
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
