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
	DAOs,
	CREATE_DAO,
	PROPOSALS,
	ADD_PROPOSAL,
	VOTE_TOKEN,
}

export enum VoteTokenType {
	DEPOSIT_TOKEN = "1",
	WITHDRAW_TOKEN = "2",
}

export enum VoteOptions {
	YES = "yes",
	NO = "no",
	ABSTAIN = "abstain",
}

export enum EndPoint {
	VOTE = "/vote",
	ADD_PROPOSAL = "/addProposal",
	ALL_DAO = "/",
	VOTE_TOKEN = "/voteTokens",
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

export enum NetworkTypes {
	NONE = "",
	MAIN_NET = "MainNet",
	TEST_NET = "TestNet",
	BETA_NET = "BetaNet",
	PRIVATE_NET = "PrivateNet", // only for testing, to be removed, Wallet connect and MyAlgo wallet doesn't support it
}

export enum SchemaType {
	UINT,
	BYTES,
}

export enum PaginationCallType {
	NAV_PREV,
	NAV_NEXT,
	JUMP_PAGE,
	FIRST_PAGE,
}
