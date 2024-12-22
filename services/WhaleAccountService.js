const WhaleAccount = require("../models/whaleAccount");
const mongoose = require("../mongodb");

// Updates or inserts a whale account
const updateWhaleAccount = async (data, rank, session) => {
  // Data format received from Bitquery
  //     {
  //       Balance: { Amount: "195517178.841427864788215213" },
  //       BalanceUpdate: {
  //         Count: "2539129",
  //         FirstDate: "2021-06-14",
  //         InAmount: "39292035840.504255554788215213",
  //         InCount: "1440484",
  //         LastDate: "2024-12-19",
  //         OutAmount: "39096518661.662827690000000000",
  //         OutCount: "1097557",
  //       },
  //       Holder: { Address: "0x8894e0a0c962cb723c1976a4421c95949be2d4e3" },
  //     },

  const {
    Balance: { Amount },
    BalanceUpdate: {
      Count,
      FirstDate,
      LastDate,
      InAmount,
      InCount,
      OutAmount,
      OutCount,
    },
    Holder: { Address },
  } = data;

  const currentBalance = mongoose.Types.Decimal128.fromString(Amount);

  const stats = {
    totalTransactions: Number(Count),
    firstActivityDate: new Date(FirstDate),
    lastActivityDate: new Date(LastDate),
    inflow: {
      amount: mongoose.Types.Decimal128.fromString(InAmount),
      count: Number(InCount),
    },
    outflow: {
      amount: mongoose.Types.Decimal128.fromString(OutAmount),
      count: Number(OutCount),
    },
  };

  const historicalRanks = {
    rank: String(rank),
    balance: currentBalance,
    timestamp: new Date(),
  };

  // Find a document in the Whale collection by the address field.
  // If the document exists, it updates it with the provided data. If it does not exist, it inserts a new document
  return await WhaleAccount.findOneAndUpdate(
    {
      address: Address,
    },
    {
      $set: {
        currentBalance,
        rank: String(rank),
        updatedAt: new Date(),
        stats,
      },
      $push: {
        historicalRanks,
      },
    },
    { upsert: true, new: true, session }
  );
};

// Drops a whale account from the top 10
const dropWhaleAccount = async (data, session) => {
  return await WhaleAccount.findOneAndUpdate(
    {
      address: data.address,
    },
    {
      $set: {
        rank: "-", // Update the rank to '-'
        updatedAt: new Date(),
      },
    },
    {
      // If true, return the modified document rather than the original document
      // By default (false), returns the document as it was before update
      new: true,
      session,
    }
  );
};

// Identifies whales that have dropped out of the top 10
const identifyDroppedWhales = async (newTop10Whales) => {
  // Query the existing top 10 whales
  const existingTop10Whales = await WhaleAccount.find(
    {
      $expr: {
        $and: [
          { $regexMatch: { input: "$rank", regex: /^[0-9]+$/ } }, // Ensure rank is a numeric string
          { $lte: [{ $toInt: "$rank" }, 10] }, // Convert to integer and check if <= 10
        ],
      },
    },
    null // Retrieve all fields
  );

  // Create a map from the new top 10 whales for quick lookup
  const newTop10WhalesMap = new Map(
    newTop10Whales.map((whale, index) => [
      whale.Holder.Address,
      { data: whale, newRank: index + 1 },
    ])
  );

  // Identify whales that have dropped out of the top 10
  return existingTop10Whales.filter(
    (whale) => !newTop10WhalesMap.has(whale.address)
  );
};

exports.updateTop10Whales = async (newTop10Whales) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Identify whales that have dropped out of the top 10.
      const droppedWhales = await identifyDroppedWhales(newTop10Whales);

      // Update the top 10 whales
      const updatePromises = newTop10Whales.map(async (whale, index) => {
        const rank = index + 1;
        return updateWhaleAccount(whale, rank, session);
      });

      // Handle whales that dropped out of the top 10
      const dropPromises = droppedWhales.map(async (whale) => {
        return dropWhaleAccount(whale, session);
      });

      // Execute all update and drop promises in parallel
      await Promise.all([...updatePromises, ...dropPromises]);
    });
  } finally {
    // Ensure the session is always closed
    await session.endSession();
  }
};

exports.getTop10Whales = async () => {
  const whales = await WhaleAccount.find({ rank: { $ne: "-" } })
    .sort({ rank: 1 })
    .limit(10)
    .select("address");

  return whales.map((whale) => whale.address);
};
