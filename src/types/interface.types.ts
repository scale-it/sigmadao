import { WalletType } from "./enum.types";
import { WebMode } from "@algo-builder/web";
import { Key, StateValue } from "./types";

export interface WalletStoreState {
	walletKind: WalletType;
	webMode: WebMode;
	address: string;
}

export interface DAO {
	dao_id?: number;
	name: string;
	govt_id?: number;
	available?: number;
	locked?: number;
	global_app_state?: Map<Key, StateValue>;
}

export interface VoteFormState {
	vote_type?: number;
	deposit_amt?: number;
}

export interface ProposalFormState {
	vote_type: string;
	url: string;
	url_hash: string;
	vote_date: [string, string];
	proposal_address: string;
	proposal_id?: number;
	from: string;
	recipient: string;
	amount?: number;
	asaId?: number;
	message: string;
}
