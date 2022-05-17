import { defineStore } from "pinia";
import { DAO } from "../types";

export default defineStore("DaoStore", {
	state: (): DAO => {
		return {
			dao_id: undefined,
			govt_id: undefined,
			name: "",
			available: undefined,
			locked: undefined,
			global_app_state: undefined,
			show_opt_in: false,
		};
	},
	actions: {
		setDaoID(value: number) {
			this.dao_id = +value;
		},
		setGovtId(value: number) {
			this.govt_id = +value;
		},
		handleLogOut() {
			// removes token from UI if user log out of wallet
			this.available = undefined;
			this.locked = undefined;
		},
		resetDaoStore() {
			// clearing user data when dao id is removed
			this.name = "";
			this.available = undefined;
			this.locked = undefined;
			this.global_app_state = undefined;
			this.show_opt_in = false;
		},
	},
});
