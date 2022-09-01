import { createRouter, createWebHistory } from "vue-router";
import CreateProposal from "../pages/CreateProposal.vue";
import AllProposal from "../pages/AllProposal.vue";
import AllDao from "../pages/AllDao.vue";
import VoteToken from "../pages/Token.vue";
import CreateDaoPage from "../pages/CreateDao.vue";
import ProposalInfo from "../pages/ProposalInfo.vue";
import { EndPoint } from "@/types";

const routes = [
	{
		path: EndPoint.ALL_DAO,
		name: "AllDao",
		component: AllDao,
		props: true,
	},
	{
		path: EndPoint.ADD_PROPOSAL,
		name: "AddProposal",
		component: CreateProposal,
		props: true,
	},
	{
		path: EndPoint.PROPOSAL_INFO,
		name: "ProposalInfo",
		component: ProposalInfo,
	},
	{
		path: EndPoint.PROPOSALS,
		name: "AllProposals",
		component: AllProposal,
		props: true,
	},
	{
		path: EndPoint.VOTE_TOKEN,
		name: "VoteToken",
		component: VoteToken,
		props: true,
	},
	{
		path: EndPoint.CREATE_DAO,
		name: "CreateDaoPage",
		component: CreateDaoPage,
		props: true,
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

export default router;
