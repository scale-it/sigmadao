export const GOV_TOKEN_ASSET = "gov-token";
export const VALIDATE_MESSAGES = {
	required: "required!",
	types: {
		url: "It is not a valid url!",
		number: "It is is not a valid number!",
	},
};

// indexer response keys
export const LOCAL_STATE = "apps-local-states";
export const GLOBAL_STATE = "global-state";
export const ASSET_ID = "asset-id";
export const APPLICATION_ID = "id";
export const KEY_VALUE = "key-value";
export const CREATED_APPS = "created-apps";
export const APPLICATION = "application";
export const PARAMS = "params";
export const ASSETS = "assets";

// DAO App local and global state map keys
export const LOCAL_STATE_MAP_KEY = {
	Deposit: "deposit",
};

export const GLOBAL_STATE_MAP_KEY = {
	DaoName: "dao_name",
};

export const DAY_TO_MILLISECONDS = 1000 * 60 * 60 * 24;

export const ProposalType = {
	ALGO_TRANSFER: 1,
	ASA_TRANSFER: 2,
	MESSAGE: 3,
};

export const MILLI_SECOND = 1000;
