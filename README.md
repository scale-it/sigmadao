<img src="./dapp/src/assets/logo.png" height="200" title="SigmaDAO" />

# SigmaDAO

A decentralized autonomous organization (DAO) is an entity with no central leadership. Decisions get made from the bottom-up, governed by a community organized around a specific set of rules enforced on a blockchain. DAOs are internet-native organizations collectively owned and managed by their members. They have built-in treasuries that are only accessible with the approval of their members. Decisions are made via proposals the group votes on during a specified period.

## DAO parameters:

Every DAO has the following parameters:

- `deposit` — a deposit amount in `gov_tokens` required to make a proposal.

- `min_support` — a minimum number of `yes` power votes (other votes like `abstain` and `no` are not counted) to validate the proposal.

- `min_duration` — minimum voting time (in number of seconds) for a new proposal.

- `max_duration` — maximum voting time (in number of seconds) for a new proposal.

- `url` — a link with more information about the DAO. We don’t need a hash as this document is meant to evolve and provide more details together with the DAO evolution.

### Contracts

To deploy and execute the above discussed functions check the `/contracts` folder and its `README.md`

### Dapp

SigmaDAO is a web application that lets anyone create a DAO, enable them to Add Proposal, Deposit and Withdraw Tokens and also allow them to Vote.

Wallets supported by the SigmaDAO are:

- [AlgoSigner](https://www.purestake.com/technology/algosigner/)
- [MyAlgo Wallet](https://wallet.myalgo.com/new-account)
- [Wallet Connect](https://walletconnect.com/)

To setup the SigmaDAO website follow the steps in `/dapp` folder `README.md`
