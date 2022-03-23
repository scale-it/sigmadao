import { defineStore } from "pinia";
import { VoteFormState } from "../types";

export default defineStore("VoteStore", {
	state: (): VoteFormState => {
		return {
			vote: undefined,
			proposal_id: undefined,
		};
	},
	actions: {
		setFormValue(value: VoteFormState) {
			this.vote = value.vote;
			this.proposal_id = value.proposal_id;
		},
	},
});
