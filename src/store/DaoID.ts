import { defineStore } from "pinia";
import { DAO } from "../types";

export default defineStore("DaoIDStore", {
	state: (): DAO => {
		return {
			dao_id: undefined,
			govt_id: undefined,
			name: "",
			available: undefined,
			locked: undefined,
		};
	},
	actions: {
		setDaoID(value: number) {
			this.dao_id = +value;
		},
		setGovtId(value: number) {
			this.govt_id = +value;
		},
	},
});
