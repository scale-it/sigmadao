<img src="./src/assets/logo.png" height="200" title="Sigma Dao" />

# Sigma Dao

Sigma Dao is a web application that let's an user create a dao, add proposal, deposit tokens and vote.

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

## Development

Start the development server on http://localhost:3000

```bash
yarn dev
```

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
