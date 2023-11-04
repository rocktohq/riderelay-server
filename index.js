const express = require("express");
const port = process.env.PORT || 5000;
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Default Route
app.get("/", (req, res) => {
  res.send("RideRelay Server is running");
});

// Listener

app.listen(port, () => {
  console.log(`RideRelay Server is running on port ${port}`);
});
