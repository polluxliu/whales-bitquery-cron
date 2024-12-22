const mongoose = require("../mongodb");

// Define the schema
const schema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  from: {
    type: String,
    required: true,
    index: true,
  },
  to: {
    type: String,
    required: true,
    index: true,
  },
  value: {
    type: mongoose.Schema.Types.Decimal128,
    require: true,
  },
  blockNumber: {
    type: Number,
    required: true,
  },
  blockTime: {
    type: Date,
    required: true,
  },
});

// Create a Mongoose model based on the schema
const Transaction = mongoose.model("Transaction", schema);

module.exports = Transaction;
