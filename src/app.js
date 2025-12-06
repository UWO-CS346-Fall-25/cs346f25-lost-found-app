// -------------------------
// Required Modules
// -------------------------
require("dotenv").config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const csrf = require('csurf');
const cookieParser = require("cookie-parser");

const { supabaseAdmin } = require("./models/supabaseAdmin.js");
const { supabase } = require("./models/supabaseClient.js");
const { showAllUploads } = require("./controllers/allItemsController.js");
const { getBuildingHours } = require("./controllers/buildingHoursController.js");

const uploadRoutes = require('./routes/upload');
const indexRoutes = require('./routes/index');
const buildingHoursRoutes = require("./routes/buildingHours.js");

// -------------------------
// Initialize Express App
// -------------------------
const app = express();

// -------------------------
// Security Middleware
// -------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// -------------------------
// View Engine Setup
// -------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// -------------------------
// Body Parsing & Static Files
// -------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(process.cwd(), "src/public/js/uploads")));

app.use(cookieParser());

// -------------------------
// Session Config
// -------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// -------------------------
// CSRF (optional)
// -------------------------
const csrfProtection = csrf({ cookie: false });

// -------------------------
// Make user available in EJS
// -------------------------
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// -------------------------
// Route Guard
// -------------------------
function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// -------------------------
// Protected Homepage Route
// -------------------------
app.get("/", requireAuth, async (req, res) => {
  // fetch lost items without rendering
  const { lostItems } = await showAllUploads(req, res, true);

  // enrich each item with Google Building Hours
  for (let item of lostItems) {
    const info = await getBuildingHours(item.location);
    item.hours = info.hours; // array or null
  }

  res.render("allResults", {
    title: "All Results",
    lostItems
  });
});

// -------------------------
// Other Routes
// -------------------------
app.use('/', indexRoutes);
app.use('/upload', uploadRoutes);
app.use("/api/building-hours", buildingHoursRoutes);

// Registration Page
app.get('/register', (req, res) => {
  res.render('register', { title: 'register' });
});

// Login Page
app.get('/login', (req, res) => {
  res.render('login', { title: 'login' });
});

// Upload Page
app.get('/upload', (req, res) => {
  res.render('upload', { title: 'upload' });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// -------------------------
// Registration Logic
// -------------------------
app.post("/register", async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword)
    return res.status(400).send("Missing fields.");
  if (password !== confirmPassword)
    return res.status(400).send("Passwords do not match.");

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    console.error(error);
    return res.status(400).send(`Error: ${error.message}`);
  }

  res.redirect("/login?registered=1");
});

// -------------------------
// Login Logic
// -------------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).send("Missing email or password.");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Login failed:", error.message);
    return res.status(401).render("login", {
      title: "login",
      error: "Invalid email or password."
    });
  }

  req.session.user = { id: data.user.id, email: data.user.email };
  res.redirect("/");
});

// -------------------------
// 404 Handler
// -------------------------
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    error: { status: 404 },
  });
});

// -------------------------
// Error Handler
// -------------------------
app.use((err, req, res, _next) => {
  if (process.env.NODE_ENV === 'development') console.error(err.stack);

  res.status(err.status || 500).render('error', {
    title: 'Error',
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// -------------------------
// Start Server
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
