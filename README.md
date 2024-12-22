# Whale Account Transaction Monitor

A scheduled monitoring system that tracks cryptocurrency whale accounts and their transactions using Bitquery API v2. Currently configured for Binance Network (BSC) but can be easily adapted for other blockchain networks.

## Overview

This project consists of two cron jobs that work together to monitor whale accounts and their trading activities:

- **Whale Job**: Identifies and updates whale accounts based on configured criteria.
- **Transaction Job**: Tracks and records transactions made by identified whale accounts.

The jobs run at configurable intervals - typically the Whale Job runs less frequently (e.g., daily) while the Transaction Job runs more frequently (e.g., every 10 minutes) to capture real-time trading activities.

## Features

- Automated whale account identification
- Real-time transaction monitoring
- Data persistence in MongoDB
- Mutex lock mechanism to prevent concurrent job execution
- Configurable job schedules
- Environment-based configuration

## Prerequisites

- Node.js
- MongoDB
- Bitquery API access token (Register at [Bitquery.io](https://bitquery.io))

## Installation

1. Clone the repository.
2. Install dependencies:

```
npm install
```

3. Create environment configuration files:
   Create `.env.development` and `.env.production` with the following variables:

```
BITQUERY_API=
BITQUERY_API_KEY=
MONGO_URI=

WHALE_JOB_INTERVAL=
TRANSACTION_JOB_INTERVAL=
```

## Dependencies

- **axios**: HTTP client for API requests
- **mongoose**: MongoDB object modeling tool
- **async-mutex**: Lock mechanism implementation
- **dotenv**: Environment configuration management
- **node-cron**: Task scheduler

## Environment Variables

- **BITQUERY_API**: Bitquery API endpoint
- **BITQUERY_API_KEY**: Your Bitquery API access token
- **MONGO_URI**: MongoDB connection string
- **WHALE_JOB_INTERVAL**: Cron schedule for whale account identification
- **TRANSACTION_JOB_INTERVAL**: Cron schedule for transaction monitoring

## Data Storage

The system uses MongoDB with two collections:

1. **Whale accounts collection**
2. **Whale transactions collection**

## Note

Make sure to obtain your Bitquery API access token by registering at [Bitquery.io](https://bitquery.io) before running the application.
