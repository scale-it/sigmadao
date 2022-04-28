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
	CREATE_DAO,
	DAOS,
	PROPOSALS,
	ADD_PROPOSAL,
}

export enum VoteOptions {
	ABSTAIN = "Abstain",
	YES = "Yes",
	NO = "No",
}

export enum EndPoint {
	VOTE = "/vote",
	ADD_PROPOSAL = "/addProposal",
	ALL_DAO = "/allDao",
}

export enum DAOActions {
	ADD_PROPOSAL = "str:add_proposal",
	DEPOSIT_VOTE_TOKEN = "str:deposit_vote_token",
	REGISTER_VOTE = "str:register_vote",
	EXECUTE = "str:execute",
	WITHDRAW_VOTE_DEPOSIT = "str:withdraw_vote_deposit",
	CLEAR_VOTE_RECORD = "str:clear_vote_record",
	CLOSE_PROPOSAL = "str:close_proposal",
}
