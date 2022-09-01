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
	<description :content="CLOSE_PROPOSAL_DESCRIPTION"></description>
	<a-row>
		<a-col :xs="{ span: 20, offset: 2 }" :sm="{ span: 14, offset: 6 }">
			<p v-if="checkCloseValidity()">
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
			:disabled="checkCloseValidity()"
			@click="handleCloseProposal"
			>Close</a-button
		>
	</a-row>
</template>

<script lang="ts">
import {
	loadingMessage,
	openErrorNotificationWithIcon,
	openSuccessNotificationWithIcon,
	SUCCESSFUL,
	successMessage,
	UNSUCCESSFUL,
	VALIDATE_MESSAGES,
	EXECUTE_PROPOSAL_DESCRIPTION,
	CLOSE_PROPOSAL_DESCRIPTION,
} from "@/constants";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import { defineComponent, reactive } from "vue";
import { searchApplicationAndAccount } from "@/indexer";
import { LogicSigAccount } from "algosdk/dist/types/src/logicsig";
import { getProposalLsig } from "@/contract/dao";
import Description from "@/UIKit/Description.vue";
import { closeProposal } from "@/utility";
import ProposalStore from "@/store/ProposalStore";
import moment from "moment";

export default defineComponent({
	name: "CloseProposal",
	components: { Description },
	data() {
		return {
			error: "",
			key: "CloseProposalKey",
		};
	},
	setup() {
		const daoStore = reactive(DaoID());
		const walletStore = reactive(WalletStore());
		const proposalStore = reactive(ProposalStore());
		return {
			daoStore,
			walletStore,
			validateMessages: VALIDATE_MESSAGES,
			EXECUTE_PROPOSAL_DESCRIPTION,
			CLOSE_PROPOSAL_DESCRIPTION,
			proposalStore,
		};
	},
	methods: {
		errorDescription() {
			if (this.proposalStore.voting_end > moment(new Date()).unix()) {
				return "Voting period has not yet finished.";
			} else if (this.proposalStore.executed === 1) {
				return "Proposal has already been executed.";
			}
			return "Execution period has already ended.";
		},
		async checkCloseValidity() {
			// proposal is executed or failed
			if (
				this.proposalStore.executed === 1 ||
				this.proposalStore.execute_before < moment(new Date()).unix()
			) {
				return true;
			}
			return false;
		},
		async handleCloseProposal() {
			loadingMessage(this.key);

			const lsig: LogicSigAccount = await getProposalLsig(
				this.daoStore.dao_id as number,
				this.walletStore.address
			);
			// checking if the requestor is proposal creator
			if (lsig.address() === this.proposalStore.proposal_addr) {
				try {
					await closeProposal(
						this.walletStore.address,
						lsig,
						this.daoStore.govt_id as number,
						this.daoStore.dao_id as number,
						this.walletStore.webMode
					);
					searchApplicationAndAccount(); // to update locked and available token on UI
					successMessage(this.key);
					openSuccessNotificationWithIcon(SUCCESSFUL, "Proposal is closed.");
				} catch (error) {
					this.error = error.message;
					openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
				}
			} else {
				openErrorNotificationWithIcon(
					UNSUCCESSFUL,
					"Only creator of the proposal can close the proposal."
				);
			}
		},
	},
});
</script>

<style></style>
