import { defineStore } from "pinia";
import { VoteFormState } from "../types";

export default defineStore("VoteStore", {
	state: (): VoteFormState => {
		return {
			vote_type: undefined,
			deposit_amt: undefined,
			withdraw_amt: undefined,
		};
	},
	actions: {
		setFormValue(value: VoteFormState) {
			this.vote_type = value.vote_type;
			this.deposit_amt = value.deposit_amt;
			this.withdraw_amt = value.withdraw_amt;
		},
	},
});
