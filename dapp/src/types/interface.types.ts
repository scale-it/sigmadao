import {
	Key,
	NetworkTypes,
	StateValue,
	WebModeTypes,
	WalletType,
	ProposalFilterType,
	Proposal
} from "@/types";
import { HttpNetworkConfig } from "@algo-builder/web/build/types";

export interface WalletStoreState {
	walletKind: WalletType;
	webMode: WebModeTypes;
	address: string;
	network: NetworkTypes;
}

export interface DAO {
	dao_id?: number;
	name: string;
	govt_id?: number;
	available?: number;
	locked?: number;
	global_app_state?: Map<Key, StateValue>;
	show_opt_in: boolean;
	searchDaoId?: number;
	psqlData: Map<number, DaoTableData>;
}

export interface VoteFormState {
	vote_type?: number;
	deposit_amt?: number;
	withdraw_amt?: number;
}

export interface ProposalFormState {
	proposal_name: string;
	proposal_type?: Proposal;
	url: string;
	url_hash: string;
	vote_date: [string, string];
	proposalAddress: string;
	recipient: string;
	amount?: number;
	asaId?: number;
	message: string;
	execute_before: string;
}

export interface DaoItemType {
	appId?: number;
	appParams?: string;
	assetId?: number;
}

export interface DaoTableData {
	dao_id: number;
	token_id: number;
	token_name: string;
	name: string;
	link: string;
	key?: number;
	proposal_count?: number;
	dao_address?: string;
	lsig_fund_algo?: number
}

// Proposal Table interfaces
export interface ProposalTableData {
	key?: number;
	proposal_addr?: string;
	amount?: number;
	from?: string;
	hash_algo?: string;
	recipient?: string;
	executed?: number;
	name: string;
	msg: string;
	type: number;
	url: string;
	url_hash: string;
	voting_start: number; // seconds
	voting_end: number; // seconds
	execute_before: number; // seconds
	yes?: number;
	no?: number;
	abstain?: number;
	asa_id?: number;
}

export interface ProposalTableStore {
	filterType: ProposalFilterType;
	psqlData: Map<number, ProposalTableData>;
	loadTable: () => void;
}

export interface UnknownObject {
	[key: string]: string | number | boolean;
}

export interface CreateDaoFormState {
	token_id?: number; // gov asa asset index
	min_deposit_amt?: number; // deposit required to make a proposal
	min_support?: number; // minimum number of yes power votes to validate proposal
	min_duration?: number; // minimum voting time in number of seconds
	max_duration?: number; // maximum voting time in number of seconds
	url?: string;
	dao_name?: string;
}

export interface NetworkConfig extends HttpNetworkConfig {
	backendBaseURL: string,
};
