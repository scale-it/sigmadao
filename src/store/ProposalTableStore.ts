import { defineStore } from "pinia";
import {
	ProposalTableStore,
	ProposalTableData,
	ProposalFilterType,
} from "../types";

export default defineStore("ProposalTableStore", {
	state: (): ProposalTableStore => {
		return {
			filterType: ProposalFilterType.All,
			psqlData: new Map<number, ProposalTableData>(),
		};
	},
});
