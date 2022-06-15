export const GOV_TOKEN_ASSET = "gov-token";
export const VALIDATE_MESSAGES = {
	required: "required!",
	types: {
		url: "It is not a valid url!",
		number: "It is is not a valid number!",
	},
};

// DAO App local and global state map keys
export const LOCAL_STATE_MAP_KEY = {
	Deposit: "deposit",
};

export const GLOBAL_STATE_MAP_KEY = {
	DaoName: "dao_name",
	Url: "url",
};

export const DAY_TO_MILLISECONDS = 1000 * 60 * 60 * 24;

export const ProposalType = {
	ALGO_TRANSFER: 1,
	ASA_TRANSFER: 2,
	MESSAGE: 3,
};

export const MILLI_SECOND = 1000;

export const daoAppMessage = {
	ALREADY_OPT_IN: "You have already Opted-in DAO App",
	SUCCESSFUL: (daoID: number) => `Your DAO App of ID ${daoID} is selected.`,
	UNSUCCESFUL: "Unsuccessful while getting DAO App Opt-in Details",
};

export const voteMessage = {
	SUCCESSFUL: "Your vote is registered.",
};

export const proposalMessage = {
	SUCCESSFUL: "Your Proposal has been created.",
};

export const depositTokenMessage = {
	SUCCESSFUL: (amt: number) => `Your ${amt} tokens have been deposited.`,
};

export const withdrawTokenMessage = {
	SUCCESSFUL: (amt: number) => `Your ${amt} tokens have been withdrawn.`,
};

export const walletMessage = {
	NETWORK_ISSUE: (walletType: string) =>
		`Please select a network to connect with ${walletType}`,
};

export const ROWS_PER_PAGE = 40; // for pagination

export const quotesWrapper = (value: string | null) => {
	return typeof value === "string" ? '"' + value + '"' : value;
};

export const MAIN_NET_URL = "https://node.algoexplorerapi.io";
export const TEST_NET_URL = "https://node.testnet.algoexplorerapi.io";
export const BETA_NET_URL = "https://node.betanet.algoexplorerapi.io";
export const ALGO_BUILDER_URL = "https://algobuilder.dev/";
