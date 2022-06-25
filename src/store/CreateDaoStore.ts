import { defineStore } from "pinia";
import { CreateDaoFormState } from "../types";

export default defineStore("CreateDAOStore", {
	state: (): CreateDaoFormState => {
		return {};
	},
});
