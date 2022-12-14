<template>
	<div id="dao-info">
		<a-breadcrumb class="margin_bottom_sm">
			<a-breadcrumb-item
				><a @click="redirectToAllDao">All Dao</a></a-breadcrumb-item
			>
			<a-breadcrumb-item>Dao Info</a-breadcrumb-item>
		</a-breadcrumb>
		<h4 class="text_center">{{ daoInfo.name }} Details</h4>
		<div class="dao_info_layout">
			<div class="flex_1">
				<a-descriptions :column="1" bordered>
					<a-descriptions-item label="App ID">{{
						daoInfo.dao_id
					}}</a-descriptions-item>
					<a-descriptions-item label="App Name">{{
						daoInfo.name
					}}</a-descriptions-item>
					<a-descriptions-item label="Token ID">{{
						daoInfo.govt_id
					}}</a-descriptions-item>
					<a-descriptions-item label="URL">
						<a :href="'//' + daoInfo.daoURL" target="_blank">
							{{ daoInfo.daoURL }}
						</a>
					</a-descriptions-item>
				</a-descriptions>
			</div>
			<div class="flex_1">
				<a-descriptions :column="1" bordered>
					<a-descriptions-item label="App address">
						<address-copyable :walletAddress="daoInfo.daoAddress" />
					</a-descriptions-item>
					<a-descriptions-item label="Treasury Address">
						<address-copyable :walletAddress="accountDetails.daoFundLsigAddr" />
					</a-descriptions-item>
					<a-descriptions-item label="Algo Amount">{{
						accountDetails.algoAmt
					}}</a-descriptions-item>
				</a-descriptions>
			</div>

			<div class="break_flex_row"></div>
			<div class="margin_top_med flex_1">
				<div class="flexbox_justify_space">
					<h4>Conditions for Creating Proposal</h4>
					<a-button type="link" @click="redirectToProposals">
						Checkout Proposals
					</a-button>
				</div>
				<a-descriptions :column="1" bordered>
					<a-descriptions-item label="Minimum Duration for Voting Period">{{
						daoInfo.minDuration
					}}</a-descriptions-item>
					<a-descriptions-item label="Maximum Duration for Voting Period">{{
						daoInfo.maxDuration
					}}</a-descriptions-item>
					<a-descriptions-item label="Minimum deposit of Gov Token"
						>{{ daoInfo.minDepositAmt }} Gov Tokens</a-descriptions-item
					>
				</a-descriptions>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import DaoID from "@/store/DaoID";
import { GLOBAL_STATE_MAP_KEY } from "@/constants";
import { redirectTo, toDaysMinutesSeconds } from "@/utility";
import { getApplicationAddress, microalgosToAlgos } from "algosdk";
import { getDaoFundLSig } from "@/contract/dao";
import { getAccountInfoByAddress } from "@/indexer";
import { EndPoint } from "@/types";
import AddressCopyable from "@/UIKit/Address.vue";

export default defineComponent({
	name: "DaoInfoPage",
	components: { AddressCopyable },
	setup() {
		const daoStore = DaoID();
		const maxDuration = toDaysMinutesSeconds(
			daoStore.global_app_state?.get(GLOBAL_STATE_MAP_KEY.MaxDuration) as number
		);

		const minDuration = toDaysMinutesSeconds(
			daoStore.global_app_state?.get(GLOBAL_STATE_MAP_KEY.MinDuration) as number
		);
		const minDepositAmt = daoStore.global_app_state?.get(
			GLOBAL_STATE_MAP_KEY.Deposit
		);
		const daoURL = daoStore.global_app_state?.get(GLOBAL_STATE_MAP_KEY.Url);
		const daoAddress = getApplicationAddress(daoStore.dao_id as number);
		const accountDetails = reactive({
			daoFundLsigAddr: "",
			algoAmt: 0,
		});

		async function getDAOAccountInfo() {
			accountDetails.daoFundLsigAddr = (
				await getDaoFundLSig(daoInfo.dao_id as number)
			).address();
			accountDetails.algoAmt = microalgosToAlgos(
				(await getAccountInfoByAddress(daoAddress))?.amount ?? 0
			);
		}
		onMounted(async () => {
			await getDAOAccountInfo();
		});

		const daoInfo = {
			...daoStore,
			maxDuration,
			minDuration,
			minDepositAmt,
			daoAddress,
			daoURL,
		};

		return {
			daoInfo,
			accountDetails,
		};
	},
	methods: {
		redirectToAllDao() {
			redirectTo(this.$router, EndPoint.ALL_DAO);
		},
		redirectToProposals() {
			redirectTo(this.$router, EndPoint.PROPOSALS);
		},
	},
});
</script>
