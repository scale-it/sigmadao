import { defineStore } from "pinia";
import { ProposalTableData } from "../types";

export default defineStore("ProposalStore", {
	state: (): ProposalTableData => {
		return {
			key: undefined,
			proposal_addr: undefined,
			amount: undefined,
			from: undefined,
			hash_algo: undefined,
			recipient: undefined,
			executed: undefined,
			name: "",
			msg: "",
			type: 0,
			url: "",
			url_hash: "",
			voting_start: 0, // seconds
			voting_end: 0, // seconds
			execute_before: 0, // seconds
			yes: undefined,
			no: undefined,
			abstain: undefined,
		};
	},
	actions: {
		setInfo(record: ProposalTableData) {
			this.$state = record;
		},
		resetProposalStore() {
			this.$state.key = undefined;
			this.$state.proposal_addr = undefined;
			this.$state.amount = undefined;
			this.$state.from = undefined;
			this.$state.hash_algo = undefined;
			this.$state.recipient = undefined;
			this.$state.executed = undefined;
			this.$state.name = "";
			this.$state.msg = "";
			this.$state.type = 0;
			this.$state.url = "";
			this.$state.url_hash = "";
			this.$state.voting_start = 0; // seconds
			this.$state.voting_end = 0; // seconds
			this.$state.execute_before = 0; // seconds
			this.$state.yes = undefined; // seconds
			this.$state.no = undefined; // seconds
			this.$state.abstain = undefined; // seconds
		},
	},
});
