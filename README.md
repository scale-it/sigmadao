<img src="./src/assets/logo.png" height="200" title="Sigma Dao" />

# Sigma Dao

Sigma Dao is a web application that let's a user create a DAO, enable them to Add Proposal, Deposit and Withdraw Tokens and also allow them to Vote.

Wallets supported by Sigma Dao are:

- [AlgoSigner](https://www.purestake.com/technology/algosigner/)
- [MyAlgo Wallet](https://wallet.myalgo.com/new-account)
- [Wallet Connect](https://walletconnect.com/)

## Requirements

- Node version >=14.11.0
- yarn 3.2
- PostgreSQL >= 12

## Setup

Install the dependencies

```bash
yarn install
```

## Setup the Sigma Dao role and table in PostgreSQL with read only access to database

Follow the examples/dao [README.MD](https://github.com/scale-it/algo-builder/blob/develop/examples/dao/README.md#setup-sigma-dao) in algo-builder to setup the Sigma Dao role and table in PostgreSQL.

## Development

Start the development server on http://localhost:3000

```bash
yarn dev
```

Backend is running on [postgraphile](https://www.graphile.org/postgraphile/) which connects to PostgreSQL database. [Postgraphile](https://www.graphile.org/postgraphile/) has automatic resolver which reads the schema of table and function for auto query generation.

Start the backend development server on http://localhost:4000/graphiql

```bash
yarn server
```

## Production

Build the application for production:

```bash
yarn build
```

Checkout the [deployment documentation](https://vuejs.org/guide/best-practices/production-deployment.html)
