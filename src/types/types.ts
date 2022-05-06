import {
	MyAlgoWalletSession,
	WallectConnectSession,
	WebMode,
} from "@algo-builder/web";

export type StateValue = string | number | bigint;

export type Key = string;

export type DateRange = "start" | "end";

export type WebModeTypes =
	| WebMode
	| MyAlgoWalletSession
	| WallectConnectSession;
