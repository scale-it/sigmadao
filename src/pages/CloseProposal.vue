<template>
	<a-row>
		<a-col :xs="{ span: 20, offset: 2 }" :sm="{ span: 14, offset: 6 }">
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
			<a-form
				:label-col="{ span: 12 }"
				:wrapper-col="{ span: 12 }"
				:model="formState"
				name="ExecuteProposal"
				autocomplete="off"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
				@validate-messages="validateMessages"
			>
				<a-form-item :wrapper-col="{ offset: 12, span: 20 }">
					<a-button type="primary" html-type="submit">Close Proposal</a-button>
				</a-form-item>
			</a-form>
		</a-col>
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
	EXECUTE_PROPOSAL_DESCRIPTION,
	PROPOSAL_EXECUTED,
	CLOSE_PROPOSAL_DESCRIPTION,
} from "@/constants";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import { defineComponent, reactive } from "vue";
import { searchApplicationAndAccount } from "@/indexer";
import ProposalStore from "@/store/ProposalStore";
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
		const formState = reactive({
			withdraw_amt: 0,
		});
		const daoStore = reactive(DaoID());
		const walletStore = reactive(WalletStore());
		const proposalStore = reactive(ProposalStore());
		return {
			formState,
			daoStore,
			walletStore,
			validateMessages: VALIDATE_MESSAGES,
			proposalStore,
			EXECUTE_PROPOSAL_DESCRIPTION,
			CLOSE_PROPOSAL_DESCRIPTION,
		};
	},
	methods: {
		async onFinish() {
			console.log(this.proposalInfo);
			this.error = overallErrorCheck();
			if (!this.error) {
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
			}
		},
		onFinishFailed(errorinfo: Event) {
			console.warn("Failed:", errorinfo);
		},
	},
});
</script>

<style></style>
