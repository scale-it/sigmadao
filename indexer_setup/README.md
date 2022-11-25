# Sigma DAO Indexer Setup

Check [Sigma DAO Indexer](https://github.com/scale-it/sigmadao-indexer) for installation details.

We provide additional Makefile to update Postgresql setup (user, extensions and tables), required for the dapp backend.

Indexer should be running before executing the scripts below.

1.  Create a sigma dao user, if not already created:

        make create-sigma-dao-user

2.  Setup sigma dao, indexer should be running before executing this script:

        make setup-sigma-dao

3.  Run below script to delete the sigma dao user, sigma dao user should be present:

        make drop-sigma-dao-user
