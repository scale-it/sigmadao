export enum WalletType {
	NONE,
	ALGOSIGNER = "AlgoSigner",
	MY_ALGO = "My Algo Connect",
	WALLET_CONNECT = "Wallet Connect",
}

export enum ASA {
	NONE,
	ALGOSIGNER,
	MY_ALGO,
	WALLET_CONNECT,
}

export enum NavigationKey {
	VOTE,
	ADD_PROPOSAL,
	CREATE_DAO,
	ALL_DAO,
}

export enum VoteOptions {
	ABSTAIN,
	YES,
	NO,
}

export enum ProposalType {
	ALGO = "algo",
	ASA = "asa",
	MESSAGE = "msg",
}
