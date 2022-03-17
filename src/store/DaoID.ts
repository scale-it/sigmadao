import { defineStore } from "pinia";
import { DaoID } from "../types";

export default defineStore("DaoIDStore", {
	state: (): DaoID => {
		return {
			id: undefined,
		};
	},
	actions: {
		setDaoID(value: number) {
			this.id = value;
		},
	},
});
