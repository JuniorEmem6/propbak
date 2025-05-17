const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("./models/admin");
const Coupon = require("./models/coupon");
const Subscriber = require("./models/subscriber");

const app = express();

const JWT_SECRET = "big_secret";

mongoose
  .connect(
    "mongodb+srv://dealbliss:dealblissng2000@cluster0.rzcv1.mongodb.net/dealbliss?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to MongoDB");
    // seedAdmin();
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

//App level middleware
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];

  // Check if the authorization header is present
  if (!authorizationHeader)
    return res.status(403).json({ error: "Access denied" });

  // Split the string to get the token (the second part after "Bearer")
  const token = authorizationHeader.split(" ")[1];

  // If token is missing, deny access
  if (!token) return res.status(403).json({ error: "Access denied" });

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    req.user = user; // Attach user to the request object
    next(); // Proceed to the next middleware/route handler
  });
};

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin)
      return res.status(401).json({ error: "Invalid username or password" });

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid username or password" });

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error during login" });
  }
});

// Seed admin data
const seedAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ username: "Eragon001" });
    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("Eragonjr", 10);
    const admin = new Admin({
      username: "Eragon",
      password: hashedPassword,
    });
    await admin.save();
    console.log("Admin created");
  } catch (err) {
    console.error("Error seeding admin:", err);
  }
};

app.post("/subscribe", (req, res) => {
  const {email, site} = req.query;
  
  const newSubscriber = new Subscriber({
    email,
    site
  });

  newSubscriber
    .save()
    .then(() =>
      res.status(201).json({ message: "Subsciber added successfully" })
    )
    .catch((err) => res.status(500).json({ error: "Error adding subscriber" }));
});

app.get("/get-subscribed", authenticateToken, (req, res) => {
    Subscriber.find()
    .then((subscriber) => res.json(subscriber))
    .catch((err) => res.status(500).json({ error: "Error fetching coupons" }));
});

app.post("/coupon", (req, res) => {
  const { store_name, store_url, description, discount, code } = req.body; // Include link
  const newCoupon = new Coupon({
    store_name,
    store_url,
    description,
    discount,
    code,
    used: 0,
  });

  newCoupon
    .save()
    .then(() => res.status(201).json({ message: "Coupon added successfully" }))
    .catch((err) => res.status(500).json({ error: "Error adding coupon" }));
});

app.get("/coupon", authenticateToken, (req, res) => {
  Coupon.find()
    .then((coupons) => res.json(coupons))
    .catch((err) => res.status(500).json({ error: "Error fetching coupons" }));
});
// Edit a coupon's details
app.put("/coupons/:id", authenticateToken, (req, res) => {
  const couponId = req.params.id;
  const { offer, code, link } = req.body; // Include link

  Coupon.findByIdAndUpdate(couponId, { offer, code, link }, { new: true })
    .then((updatedCoupon) => res.json(updatedCoupon))
    .catch((err) => res.status(500).json({ error: "Error updating coupon" }));
});

// Delete a coupon
app.delete("/coupons/:id", authenticateToken, (req, res) => {
  const couponId = req.params.id;

  Coupon.findByIdAndDelete(couponId)
    .then(() => res.json({ message: "Coupon deleted successfully" }))
    .catch((err) => res.status(500).json({ error: "Error deleting coupon" }));
});

app.post("/verify-coupon/:id", authenticateToken, async(req, res) => {
  const couponId = req.params.id;

  try {
    const coupon = await Coupon.findById(id);

    if (coupon.verified) {
      return res.status(400).json({ message: 'Coupon has already been used' });
    }

    // Mark as verified
    coupon.verified = true;
    await coupon.save();

    return res.status(200).json({
      message: 'Coupon is now verified',
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }

});

app.post("/live-update", (req, res) => {});
app.get("/live-update", (req, res) => {});

const PORT = 3000;
app.listen(3000, () => {
  console.log(`Server running on port ${PORT}`);
});
