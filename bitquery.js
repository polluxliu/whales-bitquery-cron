const axios = require("axios");

// Fetch the top 10 wallet addresses holding USDC (with a balance greater than or equal to 1,000,000) on the Binance Smart Chain (BSC) network.
const TOP10WHALES_QUERY = `
query Whales($date: String!) {
  EVM(network: bsc, dataset: archive) {
    TokenHolders(
      date: $date
      tokenSmartContract: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
      limit: {count: 10}
      orderBy: {descending: Balance_Amount}
      where: {Balance: {Amount: {ge: "1000000"}}}
    ) {
      Balance {
        Amount
      }
      Holder {
        Address
      }
      BalanceUpdate {
        FirstDate
        LastDate
        InAmount
        InCount
        OutAmount
        OutCount
        Count 
      }
    }
  }
}
`;

// NOTE: Due to the free quota limit of Bitquery, a limit:10 has been set here.
const TOP10WHALES_TRANSACTIONS_QUERY = `
query Transactions($whaleAddresses: [String!], $startTime: DateTime!, $endTime: DateTime!) {
    EVM(dataset: combined, network: bsc) {
      from: Transactions(
        where: {Transaction: {From: {in: $whaleAddresses}}, Block: {Time: {before: $endTime, after: $startTime}}}
        limit: {count: 10}
      ) {
        Block {
          Time
          Number
        }
        Transaction {
          Hash
          Value
          From
          To
        }
      }
      to: Transactions(
        where: {Transaction: {To: {in: $whaleAddresses}}, Block: {Time: {before: $endTime, after: $startTime}}}
        limit: {count: 10}
      ) {
        Block {
          Time
          Number
        }
        Transaction {
          Hash
          Value
          From
          To
        }
      }
    }
  }
  `;

const getTimeRange = () => {
  const endTime = new Date();
  const startTime = new Date(endTime - 1 * 60 * 1000);

  return { startTime, endTime };
};

exports.fetchTop10Whales = async () => {
  const response = await axios.post(
    process.env.BITQUERY_API,
    {
      query: TOP10WHALES_QUERY,
      variables: {
        date: new Date().toISOString().split("T")[0],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.BITQUERY_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data.EVM.TokenHolders;
};

exports.fetchTransactions = async (whaleAddresses) => {
  const { startTime, endTime } = getTimeRange();

  const response = await axios.post(
    process.env.BITQUERY_API,
    {
      query: TOP10WHALES_TRANSACTIONS_QUERY,
      variables: {
        whaleAddresses,
        startTime,
        endTime,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.BITQUERY_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return { from: response.data.data.EVM.from, to: response.data.data.EVM.to };
};
