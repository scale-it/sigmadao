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
		<description :content="EXECUTE_PROPOSAL_DESCRIPTION"></description>
	</a-row>
	<a-row justify="center">
		<a-button type="primary" @click="handleExecuteProposal">Execute</a-button>
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
import { LogicSigAccount } from "algosdk/dist/types/src/logicsig";
import { getProposalLsig } from "@/contract/dao";
import Description from "@/UIKit/Description.vue";
import { executeProposal } from "@/utility";

export default defineComponent({
	name: "ExecuteProposal",
	components: { Description },
	props: ["proposalInfo"],
	data() {
		return {
			error: "",
			key: "ExecuteProposalKey",
		};
	},
	setup() {
		const daoIDStore = reactive(DaoID());
		const walletStore = reactive(WalletStore());
		return {
			daoIDStore,
			walletStore,
			validateMessages: VALIDATE_MESSAGES,
			EXECUTE_PROPOSAL_DESCRIPTION,
		};
	},
	methods: {
		async handleExecuteProposal() {
			try {
				loadingMessage(this.key);
				const lsig: LogicSigAccount = await getProposalLsig(
					this.daoIDStore.dao_id as number,
					this.walletStore.address
				);

				await executeProposal(
					this.walletStore.address,
					lsig.address(),
					this.daoIDStore.dao_id as number,
					this.proposalInfo,
					this.walletStore.webMode
				);
				searchApplicationAndAccount(); // to update locked and available token on UI
				successMessage(this.key);
				openSuccessNotificationWithIcon(SUCCESSFUL, PROPOSAL_EXECUTED);
			} catch (error) {
				errorMessage(this.key);
				this.error = error.message;
				openErrorNotificationWithIcon(UNSUCCESSFUL, error);
			}
		},
	},
});
</script>

<style></style>
