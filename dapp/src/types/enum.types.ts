export enum WalletType {
	NONE,
	ALGOSIGNER = "AlgoSigner",
	MY_ALGO = "MyAlgo Wallet",
	WALLET_CONNECT = "Wallet Connect",
}

// TODO: Update the URL when network backend is ready
export enum BACKEND_BASE_URL {
	MAIN_NET = "http://localhost:4000/api",
	TEST_NET = "http://localhost:4000/api",
	BETA_NET = "http://localhost:4000/api",
	PRIVATE_NET = "http://localhost:4000/api"
}

export enum ASA {
	NONE,
	ALGOSIGNER,
	MY_ALGO,
	WALLET_CONNECT,
}

export enum VoteTokenType {
	DEPOSIT_TOKEN = "1",
	WITHDRAW_TOKEN = "2",
}

export enum ProposalDetailType {
	DETAILS,
	WITHDRAW_AND_CLOSE_PROPOSAL,
	EXECUTE_PROPOSAL,
}

export enum VoteOptions {
	YES = "yes",
	NO = "no",
	ABSTAIN = "abstain",
}

export enum EndPoint {
	ADD_PROPOSAL = "/addProposal",
	PROPOSAL_INFO = "/proposalInfo",
	PROPOSALS = "/proposals",
	ALL_DAO = "/",
	VOTE_TOKEN = "/voteTokens",
	CREATE_DAO = "/createDao",
	PAGE_404 = "/:pathMatch(.*)*",
	DAO_INFO = '/daoInfo'
}

export enum DAOActions {
	ADD_PROPOSAL = "str:add_proposal",
	DEPOSIT_VOTE_TOKEN = "str:deposit_vote_token",
	REGISTER_VOTE = "str:register_vote",
	EXECUTE = "str:execute",
	WITHDRAW_VOTE_DEPOSIT = "str:withdraw_vote_deposit",
	CLEAR_VOTE_RECORD = "str:clear_vote_record",
	CLOSE_PROPOSAL = "str:close_proposal",
	OPT_IN_GOV_TOKEN = "str:optin_gov_token",
}

export enum NetworkTypes {
	NONE = "",
	MAIN_NET = "MainNet",
	TEST_NET = "TestNet",
	BETA_NET = "BetaNet",
	PRIVATE_NET = "Private", // only for testing, to be removed, Wallet connect and MyAlgo wallet doesn't support it
}

export enum SchemaType {
	UINT,
	BYTES,
}

export enum EncodingType {
	BASE64,
	BASE32,
	HEX,
	UTF8,
}

export enum PaginationCallType {
	NAV_PREV,
	NAV_NEXT,
	JUMP_PAGE,
	FIRST_PAGE,
}

export enum DurationType {
	DAYS,
	HOURS,
	MINUTES
}

export enum SearchDaoType {
	SEARCH_BY_APPLCATION_ID,
	SEARCH_BY_DAO_NAME,
}

export enum DateTimeFormat {
	DAY_TIME_WITH_DAY = "lll",
}

export enum ProposalFilterType {
	All = 1,
	Ongoing = 2,
	Active = 3,
	Past = 4,
}

export enum Proposal {
	ALGO_TRANSFER = 1,
	ASA_TRANSFER = 2,
	MESSAGE = 3,
}
