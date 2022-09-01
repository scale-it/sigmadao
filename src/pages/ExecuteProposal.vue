<template>
	<a-row justify="center">
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
	</a-row>
	<description :content="EXECUTE_PROPOSAL_DESCRIPTION"></description>
	<a-row>
		<a-col :xs="{ span: 20, offset: 2 }" :sm="{ span: 15, offset: 6 }">
			<a-descriptions :column="{ xs: 1, sm: 2 }">
				<a-descriptions-item label="Voting End">{{
					secToFormat(
						proposalStore.voting_end,
						DateTimeFormat.DAY_TIME_WITH_DAY
					)
				}}</a-descriptions-item>
				<a-descriptions-item label="Execute Before">{{
					secToFormat(
						proposalStore.voting_start,
						DateTimeFormat.DAY_TIME_WITH_DAY
					)
				}}</a-descriptions-item>
			</a-descriptions>
			<p v-if="!checkExecuteValidity()">
				<a-alert
					message="Warning"
					:description="errorDescription()"
					type="warning"
					show-icon
				/>
			</p>
		</a-col>
	</a-row>
	<a-row justify="center">
		<a-button
			type="primary"
			:disabled="!checkExecuteValidity()"
			@click="handleExecuteProposal"
			>Execute</a-button
		>
	</a-row>
</template>

<script lang="ts">
import {
	errorMessage,
	loadingMessage,
	openErrorNotificationWithIcon,
	openSuccessNotificationWithIcon,
	SUCCESSFUL,
	successMessage,
	UNSUCCESSFUL,
	VALIDATE_MESSAGES,
	EXECUTE_PROPOSAL_DESCRIPTION,
	PROPOSAL_EXECUTED,
} from "@/constants";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import { defineComponent, reactive } from "vue";
import { searchApplicationAndAccount } from "@/indexer";
import Description from "@/UIKit/Description.vue";
import { executeProposal, isCurrentTimeValid, secToFormat } from "@/utility";
import ProposalStore from "@/store/ProposalStore";
import { DateTimeFormat } from "@/types";
import moment from "moment";

export default defineComponent({
	name: "ExecuteProposal",
	components: { Description },
	data() {
		return {
			error: "",
			key: "ExecuteProposalKey",
			DateTimeFormat,
		};
	},
	setup() {
		const daoIDStore = reactive(DaoID());
		const walletStore = reactive(WalletStore());
		const proposalStore = reactive(ProposalStore());
		return {
			daoIDStore,
			walletStore,
			validateMessages: VALIDATE_MESSAGES,
			EXECUTE_PROPOSAL_DESCRIPTION,
			proposalStore,
			secToFormat,
		};
	},
	methods: {
		checkExecuteValidity() {
			if (
				isCurrentTimeValid(
					this.proposalStore.voting_end,
					this.proposalStore.execute_before
				)
			) {
				return true;
			}
			return false;
		},
		errorDescription() {
			if (this.proposalStore.voting_end > moment(new Date()).unix()) {
				return "Voting period has not yet finished.";
			} else if (this.proposalStore.executed === 1) {
				return "Proposal has already been executed.";
			}
			return "Execution period has already ended.";
		},
		async handleExecuteProposal() {
			try {
				loadingMessage(this.key);

				await executeProposal(
					this.walletStore.address,
					this.proposalStore.proposal_addr as string,
					this.daoIDStore.dao_id as number,
					this.proposalStore,
					this.walletStore.webMode
				);
				searchApplicationAndAccount(); // to update locked and available token on UI
				successMessage(this.key);
				openSuccessNotificationWithIcon(SUCCESSFUL, PROPOSAL_EXECUTED);
			} catch (error) {
				errorMessage(this.key);
				this.error = error.message;
				openErrorNotificationWithIcon(UNSUCCESSFUL);
			}
		},
	},
});
</script>

<style></style>
