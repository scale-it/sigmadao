import { defineStore } from "pinia";
import { ProposalStore, ProposalTableData } from "../types";

export default defineStore("ProposalStore", {
	state: (): ProposalStore => {
		return {
			selected_address: "",
			creator_address: "",
			name: "",
		};
	},
	actions: {
		setInfo(record: ProposalTableData) {
			this.selected_address = record.proposal_addr as string;
			this.creator_address = ""; // TODO :update after data is stored
			this.name = record.name;
		},
		resetProposalStore() {
			this.selected_address = "";
			this.creator_address = "";
			this.name = "";
		},
	},
});
