<template>
	<a-row type="flex" justify="center">
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
		<a-row>
			<a-col :xs="{ span: 20, offset: 2 }" :sm="{ span: 15, offset: 6 }">
				<a-descriptions :column="{ xs: 1, sm: 2 }">
					<a-descriptions-item label="Voting Start">{{
						secToFormat(
							proposalStore.voting_start,
							DateTimeFormat.DAY_TIME_WITH_DAY
						)
					}}</a-descriptions-item>
					<a-descriptions-item label="Voting End">{{
						secToFormat(
							proposalStore.voting_end,
							DateTimeFormat.DAY_TIME_WITH_DAY
						)
					}}</a-descriptions-item>
				</a-descriptions>
				<p v-if="userAlreadyVoted">
					<a-alert
						message="You have already submitted your vote."
						type="success"
						show-icon
					/>
				</p>
				<p v-if="!checkVoteValidity()">
					<a-alert
						message="Warning"
						:description="errorDescription()"
						type="warning"
						show-icon
					/>
				</p>
			</a-col>
		</a-row>
		<a-form
			:model="formState"
			name="Vote"
			autocomplete="off"
			@finish="onFinish"
			@finishFailed="onFinishFailed"
			@validate-messages="validateMessages"
		>
			<a-form-item label="Vote" name="vote_type" :rules="[{ required: true }]">
				<a-select
					v-model:value="formState.vote_type"
					placeholder="Please select your option"
					:disabled="!checkVoteValidity() || userAlreadyVoted"
				>
					<a-select-option :value="VoteOptions.ABSTAIN"
						>Abstain</a-select-option
					>
					<a-select-option :value="VoteOptions.YES">Yes</a-select-option>
					<a-select-option :value="VoteOptions.NO">No</a-select-option>
				</a-select>
			</a-form-item>
			<a-form-item>
				<a-button
					class="margin_extra_sm"
					type="primary"
					html-type="submit"
					:disabled="!checkVoteValidity() || userAlreadyVoted"
					>Vote</a-button
				>
				<a-button
					class="margin_extra_sm"
					type="primary"
					danger
					:disabled="checkClearVoteValidity()"
					@click="clearVote()"
					>Clear Vote Record
					<info-tool-tip
						data="It will clear your local state by removing the record of vote cast by you from this proposal."
					/>
				</a-button>
			</a-form-item>
		</a-form>
	</a-row>
</template>

<script lang="ts">
import {
	errorMessage,
	loadingMessage,
	openErrorNotificationWithIcon,
	openSuccessNotificationWithIcon,
	overallErrorCheck,
	SUCCESSFUL,
	successMessage,
	UNSUCCESSFUL,
	VALIDATE_MESSAGES,
	voteMessage,
} from "@/constants";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import { types } from "@algo-builder/web";
import { defineComponent, reactive } from "vue";
import VoteStore from "../store/VoteStore";
import { DAOActions, VoteOptions, DateTimeFormat } from "../types/enum.types";
import ProposalStore from "@/store/ProposalStore";
import { clearVoteRecord, secToFormat, isCurrentTimeValid } from "@/utility";
import InfoToolTip from "../components/InfoToolTip.vue";
import moment from "moment";
import { getAccountAppLocalState } from "@/indexer";

export default defineComponent({
	name: "VotePage",
	data() {
		return {
			VoteOptions,
			error: "",
			key: "VoteKey",
			DateTimeFormat,
			userAlreadyVoted: false,
		};
	},
	components: { InfoToolTip },
	setup() {
		const formState = reactive(VoteStore());
		const daoIDStore = reactive(DaoID());
		const walletStore = reactive(WalletStore());
		const proposalStore = reactive(ProposalStore());

		return {
			formState,
			daoIDStore,
			walletStore,
			validateMessages: VALIDATE_MESSAGES,
			proposalStore,
			secToFormat,
		};
	},
	methods: {
		checkVoteValidity() {
			return isCurrentTimeValid(
				this.proposalStore.voting_start,
				this.proposalStore.voting_end
			);
		},
		errorDescription() {
			if (this.proposalStore.voting_start > moment(new Date()).unix()) {
				return "Voting time period has not yet started.";
			}
			return "Voting time period is over.";
		},
		checkClearVoteValidity() {
			// proposal is executed or failed
			if (
				this.proposalStore.executed === 1 ||
				this.proposalStore.execute_before < moment(new Date()).unix()
			) {
				return true;
			}
			return false;
		},
		async clearVote() {
			try {
				await clearVoteRecord(
					this.proposalStore.proposal_addr as string,
					this.walletStore.address,
					this.daoIDStore.dao_id as number,
					this.walletStore.webMode
				);
				openSuccessNotificationWithIcon(
					SUCCESSFUL,
					`Your vote record has been cleared from ${this.proposalStore.name} proposal.`
				);
			} catch (error) {
				openErrorNotificationWithIcon(UNSUCCESSFUL, error);
			}
		},
		async onFinish() {
			this.error = overallErrorCheck();
			if (!this.error) {
				loadingMessage(this.key);
				const proposalAddress = this.proposalStore.proposal_addr as string;
				console.log(`* Register votes by ${this.walletStore.address} *`);
				// call to DAO app by voter (to register deposited votes)
				const registerVoteParam: types.ExecParams = {
					type: types.TransactionType.CallApp,
					sign: types.SignType.SecretKey,
					fromAccount: {
						addr: this.walletStore.address,
						sk: new Uint8Array(0),
					},
					appID: this.daoIDStore.dao_id as number,
					payFlags: { totalFee: 2000 },
					appArgs: [
						DAOActions.REGISTER_VOTE,
						`str:${this.formState.vote_type}`,
					],
					accounts: [proposalAddress],
				};
				try {
					await this.walletStore.webMode.executeTx([registerVoteParam]);
					openSuccessNotificationWithIcon(SUCCESSFUL, voteMessage.SUCCESSFUL);
					successMessage(this.key);
					await this.checkCurrentUserVote();
					const proposalLocalState = await getAccountAppLocalState(
						this.proposalStore.proposal_addr as string,
						this.daoIDStore.dao_id as number
					);
					if (proposalLocalState) {
						this.proposalStore.setInfoFromLocalState(proposalLocalState);
					}
				} catch (error) {
					this.error = error.message;
					errorMessage(this.key);
					console.error("Transaction Failed", error);
				}
			}
		},
		async checkCurrentUserVote() {
			const userLocalState = await getAccountAppLocalState(
				this.walletStore.address,
				this.daoIDStore.dao_id as number
			);
			const proposalLocalState = await getAccountAppLocalState(
				this.proposalStore.proposal_addr as string,
				this.daoIDStore.dao_id as number
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
		onFinishFailed(errorinfo: Event) {
			console.warn("Failed:", errorinfo);
		},
	},
	async mounted() {
		await this.checkCurrentUserVote();
	},
});
</script>

<style></style>
