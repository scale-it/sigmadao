<img src="./design/logo.svg" height="200" title="SigmaDAO" />

A decentralized autonomous organization (DAO) is an entity with no central leadership. Decisions get made from the bottom-up, governed by a community organized around a specific set of rules enforced on a blockchain. DAOs are internet-native organizations collectively owned and managed by their members. They have built-in treasuries that are only accessible with the approval of their members. Decisions are made via proposals the group votes on during a specified period.

A DAO is usually implemented using blockchain smart contracts:

- organization is managed by a defined group
- blockchain and smart contracts is a trustless execution layer where rules and decisions are recorded
- decisions are usually made by voting.

In this template, We are going to implement a DAO, where the members are defined by ASA holding (1 ASA = 1 voting power): each token holder is a DAO member and can participate equally in the governance.

## Functionality

DAO is managed by DAO members identified by a governance token. DAO functions by creating proposals:

- Everyone can create a proposal. To avoid a spam, a deposit of the gov tokens is required. The deposit is returned once the proposal is finished.
- There are 3 types of a proposal: text, Algo transfer, Asset transfer.
- Every gov token holder can vote in a proposal.
- Once proposal passes, anyone can trigger proposal execution.

### Spec document

Please read the [Sigma DAO specification](https://paper.dropbox.com/doc/Algo-Builder-DAO--BRlh~FwufNzIzk4wNUuAjLTuAg-ncLdytuFa7EJrRerIASSl) for more details about each use case.

### Smart Contract

See [contracts/README](contracts/README.md) information how the smart contracts are setup and how to create a DAO.
The project is created using [`Algo Builder`](https://algobuilder.dev).

## Setup

Requirements:

- [Sigma DAO Indexer](https://github.com/scale-it/sigmadao-indexer): a customized Algorand Indexer for Sigma DAO (we removed all unnecessary transactions and records from the indexer DB).
  See [indexer_setup/README](indexer_setup/README.md) for additional instructions required for running Indexer with SigmaDAO webserver.
- Algorand Archival Node: unfortunately Algorand Indexer requires an Algoran Archival Node, and we didn't went that deep with the Sigma DAO Indexer modifications to remove that dependency. We hope that this requirement will change in the future.
- Service to host Vue.js web UI (dapp).
- Node.js webserver: the web UI sources data through graphql interface provided by the webserver.

### Dapp

SigmaDAO Dapp is a web application that lets anyone create a DAO, enable them to Add Proposal, Deposit and Withdraw Tokens and also allow them to Vote.

Wallets supported by the SigmaDAO are:

- [AlgoSigner](https://www.purestake.com/technology/algosigner/)
- [MyAlgo Wallet](https://wallet.myalgo.com/new-account)
- [Wallet Connect](https://walletconnect.com/)

To setup the SigmaDAO website follow the steps in [dapp/README.md](dapp/README.md).
