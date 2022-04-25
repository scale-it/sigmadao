import { defineStore } from "pinia";
import { VoteFormState } from "../types";

export default defineStore("VoteStore", {
	state: (): VoteFormState => {
		return {
			vote_type: undefined,
		};
	},
	actions: {
		setFormValue(value: VoteFormState) {
			this.vote_type = value.vote_type;
		},
	},
});
