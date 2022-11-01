<template>
	<a-row>
		<a-col :span="24">
			<div v-if="error" class="margin_bottom_sm">
				<a-alert
					message="Error"
					:description="error"
					type="error"
					show-icon
					closable
					@close="error = ''"
				/>
			</div>
			<div v-if="isProposalExecuted()">
				<a-result
					status="success"
					title="Proposal has been successfully executed."
					sub-title=""
				>
				</a-result>
			</div>
		</a-col>
	</a-row>

	<a-row :gutter="[20, 20]" type="flex" justify="start">
		<a-col :xs="{ span: 24 }" :lg="{ span: 8 }">
			<a-card title="Proposal Details">
				<a-descriptions :column="1">
					<a-descriptions-item label="Name">{{
						proposalInfo.name
					}}</a-descriptions-item>
					<a-descriptions-item label="Voting Start">{{
						secToFormat(
							proposalInfo.voting_start,
							DateTimeFormat.DAY_TIME_WITH_DAY
						)
					}}</a-descriptions-item>
					<a-descriptions-item label="Voting End">{{
						secToFormat(
							proposalInfo.voting_end,
							DateTimeFormat.DAY_TIME_WITH_DAY
						)
					}}</a-descriptions-item>
					<a-descriptions-item label="Execute Before">{{
						secToFormat(
							proposalInfo.execute_before,
							DateTimeFormat.DAY_TIME_WITH_DAY
						)
					}}</a-descriptions-item>
					<a-descriptions-item label="URL">
						<a :href="'//' + proposalInfo.url" target="_blank">
							{{ proposalInfo.url }}
						</a></a-descriptions-item
					>
					<a-descriptions-item label="URL Hash">{{
						proposalInfo.url_hash
					}}</a-descriptions-item>

					<a-descriptions-item label="Type">{{
						ProposalType[proposalInfo.type]
					}}</a-descriptions-item>
					<a-descriptions-item v-if="proposalInfo.from" label="From">
						<address-copyable :walletAddress="proposalInfo.from" />
					</a-descriptions-item>
					<a-descriptions-item v-if="proposalInfo.recipient" label="Recipient">
						<address-copyable :walletAddress="proposalInfo.recipient" />
					</a-descriptions-item>
					<a-descriptions-item v-if="proposalInfo.amount" label="Amount">
						{{ getAlgoAmount(proposalInfo) }}</a-descriptions-item
					>
					<a-descriptions-item v-if="proposalInfo.asa_id" label="ASA ID">{{
						proposalInfo.asa_id
					}}</a-descriptions-item>
				</a-descriptions>
			</a-card>
		</a-col>
		<a-col :xs="{ span: 24 }" :lg="{ span: 8 }">
			<a-card title="My Vote">
				<p v-if="userAlreadyVoted">
					<a-alert
						message="You have already submitted your vote."
						type="success"
						show-icon
					/>
				</p>
				<div v-else>
					<p v-if="!checkVoteValidity()">
						<a-alert
							message="Warning"
							:description="errorDescription()"
							type="warning"
							show-icon
						/>
					</p>
					<a-select
						v-model:value="formState.vote_type"
						placeholder="Please select your option"
						:disabled="!checkVoteValidity()"
					>
						<a-select-option :value="VoteOptions.ABSTAIN"
							>Abstain</a-select-option
						>
						<a-select-option :value="VoteOptions.YES">Yes</a-select-option>
						<a-select-option :value="VoteOptions.NO">No</a-select-option>
					</a-select>
					<a-button
						class="margin_extra_sm"
						type="primary"
						@click="submitVote()"
						:disabled="!checkVoteValidity()"
						>Vote</a-button
					>
				</div>
				<div>
					<a-button
						class="margin_extra_sm"
						type="primary"
						danger
						:disabled="checkClearVoteValidity() || !userAlreadyVoted"
						@click="clearVote()"
						>Clear your Vote Record
					</a-button>
					<info-tool-tip
						data="It will clear your local state by removing the record of vote cast by you from this proposal."
					/>
				</div>
			</a-card>
		</a-col>
		<a-col :xs="{ span: 24 }" :lg="{ span: 8 }">
			<a-card title="Vote Summary">
				<a-descriptions :column="1">
					<a-descriptions-item label="Total Tokens">{{
						totalTokens
					}}</a-descriptions-item>
					<a-descriptions-item
						label="Minimum Support Tokens needed for proposal to Execute"
						>{{ minimumSupport }}</a-descriptions-item
					>
					<a-descriptions-item label="Yes Tokens">{{
						proposalInfo.yes ?? 0
					}}</a-descriptions-item>
					<a-descriptions-item label="No Tokens">{{
						proposalInfo.no ?? 0
					}}</a-descriptions-item>
					<a-descriptions-item label="Abstain Tokens">{{
						proposalInfo.abstain ?? 0
					}}</a-descriptions-item>
				</a-descriptions>

				<div v-if="isVoteRecordsAvailable()">
					<PieChart />
				</div>
				<div v-else>No vote has been submitted yet.</div>
			</a-card>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import {
	errorMessage,
	GLOBAL_STATE_MAP_KEY,
	loadingMessage,
	openErrorNotificationWithIcon,
	openSuccessNotificationWithIcon,
	ProposalType,
	SUCCESSFUL,
	successMessage,
	UNSUCCESSFUL,
	voteMessage,
} from "@/constants";
import { defineComponent, reactive, toRaw } from "vue";
import { clearVoteRecord, isCurrentTimeValid, secToFormat } from "../utility";
import {
	DAOActions,
	DateTimeFormat,
	ProposalTableData,
	VoteOptions,
} from "@/types";
import PieChart from "../components/PieChart.vue";
import AddressCopyable from "@/UIKit/Address.vue";
import DaoID from "@/store/DaoID";
import moment from "moment";
import VoteStore from "@/store/VoteStore";
import ProposalStore from "@/store/ProposalStore";
import WalletStore from "@/store/WalletStore";
import { types } from "@algo-builder/web";
import { getAccountAppLocalState, getAssetInformation } from "@/indexer";
import InfoToolTip from "@/components/InfoToolTip.vue";
import { checkProposalResult } from "@/utility";

export default defineComponent({
	name: "ProposalInfo",
	components: {
		PieChart,
		AddressCopyable,
		InfoToolTip,
	},
	data() {
		return {
			ProposalType,
			VoteOptions,
			key: "ProposalInfoKey",
			error: "",
			userAlreadyVoted: false,
			totalTokens: 0,
		};
	},
	setup() {
		const proposalInfo = reactive(ProposalStore());
		const daoStore = reactive(DaoID());
		const formState = reactive(VoteStore());
		const walletStore = reactive(WalletStore());
		const currentTime = moment(new Date()).unix();
		const minimumSupport = daoStore.global_app_state?.get(
			GLOBAL_STATE_MAP_KEY.MinSupport
		);

		return {
			DateTimeFormat,
			secToFormat,
			proposalInfo,
			daoStore,
			formState,
			walletStore,
			currentTime,
			minimumSupport,
		};
	},
	methods: {
		checkClearVoteValidity() {
			// proposal should not be active
			if (
				// executed
				this.proposalInfo.executed === 1 ||
				// failed
				(this.proposalInfo.execute_before > this.currentTime &&
					this.proposalInfo.voting_end < this.currentTime &&
					!checkProposalResult(this.proposalInfo)) ||
				// execution date passed
				this.proposalInfo.execute_before < this.currentTime
			) {
				return false;
			}
			return true;
		},
		checkVoteValidity() {
			return isCurrentTimeValid(
				this.proposalInfo.voting_start,
				this.proposalInfo.voting_end
			);
		},
		errorDescription() {
			if (this.proposalInfo.voting_start > moment(new Date()).unix()) {
				return "Voting time period has not yet started.";
			}
			return "Voting time period is over.";
		},
		async clearVote() {
			try {
				loadingMessage(this.key);
				await clearVoteRecord(
					this.proposalInfo.proposal_addr as string,
					this.walletStore.address,
					this.daoStore.dao_id as number,
					this.walletStore.webMode
				);
				openSuccessNotificationWithIcon(
					SUCCESSFUL,
					`Your vote record has been cleared from ${this.proposalInfo.name} proposal.`
				);
				successMessage(this.key);
			} catch (error) {
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
			}
		},
		isProposalExecuted() {
			if (this.proposalInfo.executed === 1) {
				return true;
			}
			return false;
		},
		getAlgoAmount(item: ProposalTableData) {
			if (item.type === ProposalType.ALGO_TRANSFER) {
				return `${(item.amount as number) / 1e6} Algo/s`;
			}
			return item.amount;
		},
		isVoteRecordsAvailable() {
			return (
				this.proposalInfo?.yes ||
				this.proposalInfo?.no ||
				this.proposalInfo?.abstain
			);
		},
		async submitVote() {
			try {
				loadingMessage(this.key);
				const proposalAddress = this.proposalInfo.proposal_addr as string;
				console.log(`* Register votes by ${this.walletStore.address} *`);
				// call to DAO app by voter (to register deposited votes)
				const registerVoteParam: types.ExecParams = {
					type: types.TransactionType.CallApp,
					sign: types.SignType.SecretKey,
					fromAccount: {
						addr: this.walletStore.address,
						sk: new Uint8Array(0),
					},
					appID: this.daoStore.dao_id as number,
					payFlags: { totalFee: 2000 },
					appArgs: [
						DAOActions.REGISTER_VOTE,
						`str:${this.formState.vote_type}`,
					],
					accounts: [proposalAddress],
				};

				await toRaw(this.walletStore.webMode).executeTx([registerVoteParam]);
				openSuccessNotificationWithIcon(SUCCESSFUL, voteMessage.SUCCESSFUL);
				successMessage(this.key);
				await this.checkCurrentUserVote();
				const proposalLocalState = await getAccountAppLocalState(
					this.proposalInfo.proposal_addr as string,
					this.daoStore.dao_id as number
				);
				console.log("updated state", proposalLocalState);
				if (proposalLocalState) {
					this.proposalInfo.setInfoFromLocalState(proposalLocalState);
					this.$forceUpdate();
				}
			} catch (error) {
				this.error = error.message;
				errorMessage(this.key);
				console.error("Transaction Failed", error);
			}
		},
		async checkCurrentUserVote() {
			const userLocalState = await getAccountAppLocalState(
				this.walletStore.address,
				this.daoStore.dao_id as number
			);
			const proposalLocalState = await getAccountAppLocalState(
				this.proposalInfo.proposal_addr as string,
				this.daoStore.dao_id as number
			);
			const proposalId = proposalLocalState?.get("id");
			// the user local state has p_proposaladdress: proposal_id if voted
			if (userLocalState) {
				let userLocalStateKeys = [...userLocalState.entries()]
					.filter(({ 1: v }) => v === proposalId)
					.map(([k]) => k);
				this.userAlreadyVoted = userLocalStateKeys.length > 0;
			}
		},
	},
	async mounted() {
		await this.checkCurrentUserVote();
		const response = await getAssetInformation(this.daoStore.govt_id as number);
		this.totalTokens = +response?.t ?? (0 as number);
	},
});
</script>
