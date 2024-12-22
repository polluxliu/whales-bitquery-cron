const mongoose = require("../mongodb");

// Define the schema
const schema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  currentBalance: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },
  rank: {
    type: String,
    required: true,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  stats: {
    totalTransactions: Number,
    firstActivityDate: Date,
    lastActivityDate: Date,
    inflow: {
      amount: mongoose.Schema.Types.Decimal128,
      count: Number,
    },
    outflow: {
      amount: mongoose.Schema.Types.Decimal128,
      count: Number,
    },
  },
  historicalRanks: [
    {
      rank: String,
      balance: mongoose.Schema.Types.Decimal128,
      timestamp: Date,
    },
  ],
});

// Create a Mongoose model based on the schema
const WhaleAccount = mongoose.model("WhaleAccount", schema);

module.exports = WhaleAccount;
