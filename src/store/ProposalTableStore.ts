import { defineStore } from "pinia";
import { ProposalTableStore, ProposalTableData } from "../types";

export default defineStore("ProposalTableStore", {
	state: (): ProposalTableStore => {
		return {
			psqlData: new Map<number, ProposalTableData>(),
		};
	},
});
