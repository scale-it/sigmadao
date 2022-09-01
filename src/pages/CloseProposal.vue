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
		<description :content="CLOSE_PROPOSAL_DESCRIPTION"></description>
	</a-row>
	<a-row justify="center">
		<a-button type="primary" @click="handleCloseProposal">Close</a-button>
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

export default defineComponent({
	name: "CloseProposal",
	components: { Description },
	props: ["proposalInfo"],
	data() {
		return {
			error: "",
			key: "CloseProposalKey",
		};
	},
	setup() {
		const daoStore = reactive(DaoID());
		const walletStore = reactive(WalletStore());
		return {
			daoStore,
			walletStore,
			validateMessages: VALIDATE_MESSAGES,
			EXECUTE_PROPOSAL_DESCRIPTION,
			CLOSE_PROPOSAL_DESCRIPTION,
		};
	},
	methods: {
		async handleCloseProposal() {
			try {
				loadingMessage(this.key);

				const lsig: LogicSigAccount = await getProposalLsig(
					this.daoStore.dao_id as number,
					this.walletStore.address
				);
				// checking if the requestor is proposal creator
				if (lsig.address() === this.proposalInfo.proposal_addr) {
					try {
						await closeProposal(
							this.walletStore.address,
							lsig,
							this.daoStore.govt_id as number,
							this.daoStore.dao_id as number,
							this.walletStore.webMode
						);
					} catch (error) {
						openErrorNotificationWithIcon(UNSUCCESSFUL, error);
					}
				} else {
					openErrorNotificationWithIcon(
						UNSUCCESSFUL,
						"Only creator of the proposal can close the proposal."
					);
				}

				try {
					searchApplicationAndAccount(); // to update locked and available token on UI
					successMessage(this.key);
					openSuccessNotificationWithIcon(SUCCESSFUL, PROPOSAL_EXECUTED);
				} catch (error) {
					errorMessage(this.key);
					this.error = error.message;
					console.error("Transaction Failed", error);
				}
			} catch (error) {
				openErrorNotificationWithIcon(UNSUCCESSFUL, error);
			}
		},
	},
});
</script>

<style></style>
