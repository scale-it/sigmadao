import { defineStore } from "pinia";
import { CreateDaoFormState } from "../types";

export default defineStore("CreateDAOStore", {
	state: (): CreateDaoFormState => {
		return {
			token_id: undefined,
			min_deposit_amt: undefined,
			min_support: undefined,
			min_duration: undefined,
			max_duration: undefined,
			url: undefined,
			dao_name: undefined,
		};
	},
});
