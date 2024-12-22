const Transaction = require("../models/Transaction");
const mongoose = require("../mongodb");

exports.insertTransactions = async (from, to) => {
  const transactions = [];

  // Process "from" transactions
  if (from && from.length > 0) {
    from.forEach((tx) => {
      transactions.push({
        hash: tx.Transaction.Hash,
        from: tx.Transaction.From,
        to: tx.Transaction.To,
        value: mongoose.Types.Decimal128.fromString(tx.Transaction.Value),
        blockNumber: parseInt(tx.Block.Number),
        blockTime: new Date(tx.Block.Time),
      });
    });
  }

  // Process "to" transactions
  if (to && to.length > 0) {
    to.forEach((tx) => {
      transactions.push({
        hash: tx.Transaction.Hash,
        from: tx.Transaction.From,
        to: tx.Transaction.To,
        value: mongoose.Types.Decimal128.fromString(tx.Transaction.Value),
        blockNumber: parseInt(tx.Block.Number),
        blockTime: new Date(tx.Block.Time),
      });
    });
  }

  if (transactions.length === 0) {
    console.log("No transactions to insert");
    return;
  }

  // Insert the transactions
  try {
    const result = await Transaction.insertMany(transactions, {
      ordered: false, // Allows partial insert in case of errors
    });

    // Output the total number of inserted transactions
    console.log(`Inserted ${result.length} new transactions.`);
  } catch (error) {
    if (error.code === 11000) {
      const successCount = error.result?.result?.nInserted || 0;
      const duplicateCount = transactions.length - successCount;
      console.log(
        `Inserted ${successCount} new transactions. ${duplicateCount} transactions were duplicates and not inserted.`
      );
    } else {
      // If it's not a 11000 error, throw the error to let it propagate
      throw error;
    }
  }
};
