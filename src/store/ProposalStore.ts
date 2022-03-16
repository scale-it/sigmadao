import { defineStore } from "pinia";
import { ProposalFormState } from "../types";

// const store = DaoIDStore();
export default defineStore("ProposalStore", {
	state: (): ProposalFormState => {
		return {
			vote_type: "",
			url: "",
			url_hash: "",
			vote_date: ["", ""],
			proposal_address: "",
			from: "",
			recipient: "",
			amount: undefined,
			asaId: undefined,
			message: "",
		};
	},
	actions: {
		setFormValue(value: any) {
			this.vote_type = value.vote_type;
			this.url = value.url;
			this.url_hash = value.url_hash;
			this.vote_date = value.vote_date;
			this.proposal_address = value.proposal_address;
			this.from = value.from;
			this.recipient = value.recipient;
			this.amount = value.amount;
			this.asaId = value.asaId;
			this.message = value.message;
			console.log("state", this.$state);
		},
	},
});
