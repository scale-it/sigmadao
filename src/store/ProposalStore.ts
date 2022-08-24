import { defineStore } from "pinia";
import { ProposalStore } from "../types";

export default defineStore("ProposalStore", {
	state: (): ProposalStore => {
		return {
			selected_address: "",
		};
	},
	actions: {
		resetProposalStore() {
			this.selected_address = "";
		},
	},
});
