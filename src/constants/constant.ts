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
	Deposit: "deposit",
	MinDuration: "min_duration",
	MaxDuration: "max_duration",
	MinSupport: "min_support",
};
export const MINUTE_TO_SECONDS = 60;
export const HOUR_TO_SECONDS = 60 * MINUTE_TO_SECONDS;
export const DAY_TO_SECONDS = 24 * HOUR_TO_SECONDS;
export const DAY_TO_MILLISECONDS = 1000 * DAY_TO_SECONDS;

export const ProposalType = {
	ALGO_TRANSFER: 1,
	ASA_TRANSFER: 2,
	MESSAGE: 3,
	[1]: "Algo Transfer",
	[2]: "ASA Transfer",
	[3]: "Message",
};

export const PROPOSAL_LOCAL_STATE_MAP_KEY = {
	Name: "name",
	Message: "msg",
	Url: "url",
	Type: "type",
	Url_Hash: "url_hash",
	Voting_Start: "voting_start",
	Voting_End: "voting_end",
	Execute_Before: "execute_before",
	Executed: "executed",
	amount: "amount",
	From: "from",
	Recipient: "recipient",
	ASA_ID: "asa_id",
	Amount: "amount",
	Yes: "yes",
	No: "no",
	Abstain: "abstain",
};

export const MILLI_SECOND = 1000;

export const daoAppMessage = {
	ALREADY_OPT_IN: "You have already Opted-in DAO App",
	DAO_SUCCESSFUL: (daoID: number) => `Your DAO App of ID ${daoID} is selected.`,
	DAO_UNSUCCESFUL: "Unsuccessful while getting DAO App Opt-in Details",
	PROPOSAL_SUCCESSFUL: (proposalName: string) =>
		`You are now using the ${proposalName} proposal.`,
	PROPOSAL_UNSUCCESSFUL: `Couldn't select the proposal`,
	OPT_IN_SUCCESSFUL: (daoID: number) =>
		`You have successfully opted in DAO of ID ${daoID}`,
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

export const createDaoMessage = {
	SUCCESSFUL: "Your DAO is successfully deployed.",
};

export const ROWS_PER_PAGE = 40; // for pagination

export const quotesWrapper = (value: string | null) => {
	return typeof value === "string" ? '"' + value + '"' : value;
};

export const MAIN_NET_URL = process.env.VUE_APP_MAIN_NET_URL || "https://node.algoexplorerapi.io";
export const TEST_NET_URL = process.env.VUE_APP_TEST_NET_URL || "https://node.testnet.algoexplorerapi.io";
export const BETA_NET_URL = process.env.VUE_APP_BETA_NET_URL || "https://node.betanet.algoexplorerapi.io";

export const ALGO_BUILDER_URL = process.env.VUE_APP_ALGO_BUILDER_URL || "https://algobuilder.dev/";

export const DAO_CONTRACT_STATE_CONFIG = {
	localInts: 9,
	localBytes: 7,
	globalInts: 5,
	globalBytes: 2,
};

export const TOKEN_DESCRIPTION = `In order to vote for proposals you have to deposit your tokens. This protects against double voting. Your token will be locked until end of the furthest proposal you voted (to be more specific, the token will be locked until
<code>max({p in proposal_you_voted; p.end_voting_end})</code>). After
that time you can withdraw your tokens, or keep them locked to vote for
other proposals.`;

export const EXECUTE_PROPOSAL_DESCRIPTION = `Anyone can execute a proposal. User can only execute a proposal after voting end and
before the execute before.`;

export const CLOSE_PROPOSAL_DESCRIPTION = `Only proposal creator can close the proposal. This closes proposal record and returns back the deposit. It should be done after the proposal voting time has ended or it has been executed.`;

export const WITHDRAW_FROM_PROPOSAL_DESCRIPTION =
	"Only proposal creator can withdraw from the proposal. This refund back the tokens which user deposited during proposal creation.";

export const EmptyDataDescription = {
	DAO: "No Sigma DAOs Exists",
	PROPOSAL: "No Proposals Exists",
};

export const DEFAULT_FUND_AMT = 0.3;
