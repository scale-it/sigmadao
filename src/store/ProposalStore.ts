import { defineStore } from "pinia";
import { ProposalStore, ProposalTableData } from "../types";

export default defineStore("ProposalStore", {
	state: (): ProposalStore => {
		return {
			selected_address: "",
			name: "",
		};
	},
	actions: {
		setInfo(record: ProposalTableData) {
			this.selected_address = record.proposal_addr as string;
			this.name = record.name;
		},
		resetProposalStore() {
			this.selected_address = "";
			this.name = "";
		},
	},
});
