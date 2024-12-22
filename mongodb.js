const mongoose = require("mongoose");

const URI = process.env.MONGO_URI;

mongoose
  .connect(URI)
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

module.exports = mongoose;
