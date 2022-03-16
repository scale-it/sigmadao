import { WalletType } from "./enum.types";
import { WebMode } from "@algo-builder/web";

export interface WalletStoreState {
	walletKind: WalletType;
	webMode: WebMode;
}

export interface DaoID {
	id: number | undefined;
}

export interface VoteFormState {
	proposal_id: number | undefined;
	vote: number | undefined;
}

export interface ProposalFormState {
	vote_type: string;
	url: string;
	url_hash: string;
	vote_date: [string, string];
	proposal_address: string;
	from: string;
	recipient: string;
	amount: number | undefined;
	asaId: number | undefined;
	message: string;
}
