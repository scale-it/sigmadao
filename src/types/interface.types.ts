import { Wallet } from "./enum.types";
import { WebMode } from "@algo-builder/web";

export interface WalletStoreState {
	walletKind: Wallet;
	webMode: WebMode;
}
