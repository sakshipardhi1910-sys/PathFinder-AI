const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const careerRoutes = require("./routes/careerRoutes");
const speechRoutes = require("./routes/speechRoutes");
const financeRoutes = require("./routes/financeRoutes");
const assistantRoutes = require("./routes/assistantRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const rootDir = path.join(__dirname, "..");
const frontendDir = path.join(rootDir, "frontend");
const dataDir = path.join(rootDir, "data");
const feedbackFile = path.join(dataDir, "feedback.json");
const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function ensureFeedbackFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(feedbackFile)) {
    fs.writeFileSync(feedbackFile, "[]", "utf8");
  }
}

ensureFeedbackFile();

app.use(cors({
  origin(origin, callback) {
    // Supports the bundled frontend, common local dev servers, and any
    // explicitly configured deployment origins.
    if (!origin || configuredOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
    return callback(new Error("This origin is not allowed by PathFinder AI CORS policy."));
  }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(frontendDir));

app.get("/api/health", (req, res) => {
  res.json({ success: true, service: "PathFinder AI API", status: "healthy", timestamp: new Date().toISOString() });
});

app.use("/career", careerRoutes);
app.use("/speech", speechRoutes);
app.use("/finance", financeRoutes);
app.use("/assistant", assistantRoutes);

app.post("/feedback", (req, res, next) => {
  try {
    const { name, message, rating } = req.body;

    if (!name || !String(name).trim() || !message || !String(message).trim()) {
      return res.status(400).json({
        error: true,
        message: "Please provide your name and feedback message."
      });
    }

    const feedbackList = JSON.parse(fs.readFileSync(feedbackFile, "utf8") || "[]");
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: true, message: "Rating must be a whole number between 1 and 5." });
    }

    const feedback = {
      id: Date.now(),
      name: String(name).trim(),
      message: String(message).trim(),
      rating: numericRating,
      createdAt: new Date().toISOString()
    };

    feedbackList.push(feedback);
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbackList, null, 2), "utf8");
    console.log("Feedback saved:", feedback);

    res.status(201).json({
      success: true,
      message: "Feedback saved successfully.",
      feedback
    });
  } catch (error) {
    next(error);
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

// Central error handler keeps API errors readable for beginners.
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Something went wrong on the server"
  });
});

const server = app.listen(PORT, () => {
  console.log(`PathFinder AI server running at http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other process using port ${PORT}.`);
  } else {
    console.error("Failed to start server:", error.message);
  }
  process.exit(1);
});
