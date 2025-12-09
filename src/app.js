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
// ADMIN HELPERS
// -------------------------

// Check if a user is an admin
async function isAdmin(userId) {
  const { data, error } = await supabase
    .from("userroles")
    .select("role")
    .eq("auth_id", userId)
    .single();

  console.log(userId);
  if (error || !data) return false;
  return data.role === "admin";
}

// Middleware to protect admin-only routes
async function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const admin = await isAdmin(req.session.user.id);
  if (!admin) {
    return res.status(403).send("Access denied — admin only.");
  }

  next();
}


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
  const building = req.query.building || "any";

  let { lostItems } = await showAllUploads(req, res, true);

  // Apply filter
  if (building !== "any") {
    lostItems = lostItems.filter(item => item.location === building);
  }

  // Add hours
  for (let item of lostItems) {
    const info = await getBuildingHours(item.location);
    item.hours = info.hours;
  }

  res.render("allResults", {
    title: "All Results",
    lostItems,
    building 
  });
});




// -------------------------
// Protected Admin Approval Route
// -------------------------
app.get("/admin/claims", requireAdmin, async (req, res) => {
  // Get all pending claims
  const { data: claims, error: claimsError } = await supabase
    .from("claimed_items")
    .select("*")
    .eq("status", 1); // pending

  if (claimsError) {
    console.error("Claims error:", claimsError);
    return res.status(500).send("Error fetching claims.");
  }

  // 2Get all items referenced by claims
  const itemIds = claims.map(c => c.item_id);
  const { data: items, error: itemsError } = await supabase
    .from("Items")
    .select("*")
    .in("id", itemIds);

  if (itemsError) {
    console.error("Items error:", itemsError);
    return res.status(500).send("Error fetching items.");
  }

  //  Merge items into claims
  const claimsWithItems = claims.map(claim => {
    return {
      ...claim,
      item: items.find(i => i.id === claim.item_id)
    };
  });

  console.log("ADMIN CLAIMS QUERY RESULTS:", claimsWithItems);

  res.render("admin", {
  title: "Claims",
  claims: claimsWithItems
});
});




// Approve a claim
app.post("/admin/claims/:id/approve", requireAdmin, async (req, res) => {
  const claimId = req.params.id;

  // Fetch the claim so we know its item_id
  const { data: claim, error: claimError } = await supabase
    .from("claimed_items")
    .select("item_id")
    .eq("id", claimId)
    .single();

  if (claimError) {
    console.error("Error fetching claim:", claimError);
    return res.status(500).send("Could not fetch claim");
  }

  // 1 → approved
  await supabase
    .from("claimed_items")
    .update({ status: 2 })
    .eq("id", claimId);

  // update associated item
  await supabase
    .from("Items")
    .update({ status: 2 })
    .eq("id", claim.item_id);

  res.redirect("/admin/claims");
});


// Deny a claim
app.post("/admin/claims/:id/deny", requireAdmin, async (req, res) => {
  const claimId = req.params.id;

  // Fetch the claim first
  const { data: claim, error: claimError } = await supabase
    .from("claimed_items")
    .select("item_id")
    .eq("id", claimId)
    .single();

  if (claimError) {
    console.error("Error fetching claim:", claimError);
    return res.status(500).send("Could not fetch claim");
  }

  // 3 → denied
  await supabase
    .from("claimed_items")
    .update({ status: 3 })
    .eq("id", claimId);

  // Set item back to available
  await supabase
    .from("Items")
    .update({ status: 0 })
    .eq("id", claim.item_id);

  res.redirect("/admin/claims");
});



// -------------------------
// Other Routes
// -------------------------
app.use('/', indexRoutes);
app.use('/upload', uploadRoutes);
app.use("/api/building-hours", buildingHoursRoutes);

// Registration Page
// Registration Page
app.get('/register', (req, res) => {
  res.render('register', { title: 'Register', error: null });
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
// Claim Logic
// -------------------------


app.post("/claim", async (req, res) => {
  const { item_id } = req.body;
  console.log("starting claim process...");

  // You must have user authentication set up
  const user_id = req.session.user?.id; 
  if (!user_id) {
    return res.status(401).send("You must be logged in to claim an item.");
  }

  try {
    // Insert the claim request
    const { data, error } = await supabase
      .from("claimed_items")
      .insert({
        user_id: user_id,
        status: 1, // 1 = pending
        claim_time: new Date(),
        item_id: item_id   
      });

    if (error) throw error;

    await supabase
    .from("Items")
    .update({ status: 1 }) // 1 = claimed/pending
    .eq("id", item_id);


    

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error submitting claim.");
  }
});


// -------------------------
// Registration Logic
// -------------------------
app.post("/register", async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return res.render("register", { title: "Register", error: "All fields are required." });
  }

  if (password !== confirmPassword) {
    return res.render("register", { title: "Register", error: "Passwords do not match." });
  }

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    console.error(error);
    return res.render("register", { title: "Register", error: "An account with that email already exists." });
  }

  res.redirect("/login?registered=1");
});


// -------------------------
// Login Logic
// -------------------------

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.render("login", {
      title: "Login",
      error: "Invalid email or password",
      user: null
    });
  }

  const authId = authData.user.id;

  // Get the role from the userroles table
  const { data: roleData, error: roleError } = await supabase
    .from("userroles")
    .select("role")
    .eq("auth_id", authId)
    .single();

  // Store user in session INCLUDING ROLE
  req.session.user = {
    id: authId,
    email: authData.user.email,
    role: roleData?.role || "user"  // default role
  };

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
