const cron = require("node-cron");

// Load env variables
const environment = process.env.NODE_ENV || "development";
require("dotenv").config({ path: `.env.${environment}` });

const Jobs = require("./Jobs");

const jobs = new Jobs();

const startCronJobs = () => {
  // Get the cron job intervals from the environment variables
  const whaleJobInterval = process.env.WHAL_JOB_INTERVAL;
  const transactionJobInterval = process.env.TRANSACTION_JOB_INTERVAL;

  // Cron job for monitoring whales
  cron.schedule(whaleJobInterval, () => {
    jobs.executeWhaleJob();
  });

  // Cron job for monitoring transactions
  cron.schedule(transactionJobInterval, () => {
    jobs.executeTransactionJob();
  });
};

// Execute the job immediately to kick off initial data fetch
jobs.executeWhaleJob();

// Start cron jobs with intervals
startCronJobs();
