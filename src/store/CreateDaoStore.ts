import { defineStore } from "pinia";
import { CreateDaoFormState } from "../types";

export default defineStore("ProposalStore", {
	state: (): CreateDaoFormState => {
		return {};
	},
});
