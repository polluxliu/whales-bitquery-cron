const { Mutex } = require("async-mutex");

const Bitquery = require("./bitquery");
const WhaleAccountService = require("./services/WhaleAccountService");
const TransactionService = require("./services/TransactionService");

class Jobs {
  // Mutex instance to ensure that jobs do not run concurrently
  #mutex;

  constructor() {
    // Initialize the mutex for locking operations
    this.#mutex = new Mutex();
  }

  // Define a function to execute the whale job
  async executeWhaleJob() {
    this.#executeWithLock("WhaleJob", async () => {
      await this.#monitorWhales();
    });
  }

  // Define a function to execute the transaction job
  async executeTransactionJob() {
    this.#executeWithLock("TransactionJob", async () => {
      const whaleAddresses = await WhaleAccountService.getTop10Whales();

      await this.#monitorTransations(whaleAddresses);
    });
  }

  /**
   * Executes a job with a mutex lock to ensure no concurrency.
   * This method ensures that only one job runs at a time
   * @param {string} jobName - The name of the job (for logging).
   * @param {Function} callback - The callback function to execute the job.
   */
  async #executeWithLock(jobName, callback) {
    const release = await this.#mutex.acquire();
    console.log(`Starting ${jobName} at ${new Date().toISOString()}`);

    callback()
      .catch((error) => console.error(`Error in ${jobName}:`, error))
      .finally(() => {
        console.log(`Completed ${jobName} at ${new Date().toISOString()}`);
        release();
      });
  }

  // Fetches the top 10 whales from the Bitquery and updates the database.
  async #monitorWhales() {
    const data = await Bitquery.fetchTop10Whales();

    if (Array.isArray(data) && data.length > 0) {
      console.log(`Successfully fetched ${data.length} whale accounts.`);

      await WhaleAccountService.updateTop10Whales(data);
      console.log("Whale accounts successfully updated in the database.");

      // Extract whale addresses and monitor transactions immediately
      const whaleAddresses = data.map((item) => item.Holder.Address);
      await this.#monitorTransations(whaleAddresses);
    } else {
      console.log("No whale accounts fetched. Skipping update.");
    }
  }

  // Fetches the transactions from the Bitquery and updates the database.
  async #monitorTransations(whaleAddresses) {
    const { from, to } = await Bitquery.fetchTransactions(whaleAddresses);

    const fromCount = Array.isArray(from) ? from.length : 0;
    const toCount = Array.isArray(to) ? to.length : 0;
    const totalCount = fromCount + toCount;

    if (totalCount > 0) {
      console.log(`Successfully fetched ${totalCount} transactions`);

      await TransactionService.insertTransactions(from, to);
      console.log("Transactions successfully updated in the database.");
    } else {
      console.log("No transactions fetched. Skipping update.");
    }
  }
}

module.exports = Jobs;
