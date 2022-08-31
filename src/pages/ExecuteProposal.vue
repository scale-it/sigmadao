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
			<description :content="EXECUTE_PROPOSAL_DESCRIPTION"></description>
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
					<a-button type="primary" html-type="submit">Execute</a-button>
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
} from "@/constants";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import { types } from "@algo-builder/web";
import { defineComponent, reactive } from "vue";
import { searchApplicationAndAccount } from "@/indexer";
import ProposalStore from "@/store/ProposalStore";
import { LogicSigAccount } from "algosdk/dist/types/src/logicsig";
import { getProposalLsig, getDaoFundLSig } from "@/contract/dao";
import { DAOActions } from "@/types";
import Description from "@/UIKit/Description.vue";

export default defineComponent({
	name: "ExecuteProposal",
	components: { Description },
	data() {
		return {
			error: "",
			key: "ExecuteProposalKey",
		};
	},
	setup() {
		const formState = reactive({
			withdraw_amt: 0,
		});
		const daoIDStore = reactive(DaoID());
		const walletStore = reactive(WalletStore());
		const proposalStore = reactive(ProposalStore());
		return {
			formState,
			daoIDStore,
			walletStore,
			validateMessages: VALIDATE_MESSAGES,
			proposalStore,
			EXECUTE_PROPOSAL_DESCRIPTION,
		};
	},
	methods: {
		async onFinish() {
			this.error = overallErrorCheck();
			if (!this.error) {
				try {
					loadingMessage(this.key);
					const lsig: LogicSigAccount = await getProposalLsig(
						this.daoIDStore.dao_id as number,
						this.walletStore.address
					);
					const daoFundLsig: LogicSigAccount = await getDaoFundLSig(
						this.daoIDStore.dao_id as number
					);

					const executeParams: types.ExecParams[] = [
						{
							type: types.TransactionType.CallApp,
							sign: types.SignType.SecretKey,
							fromAccount: {
								addr: this.walletStore.address,
								sk: new Uint8Array(0),
							},
							appID: this.daoIDStore.dao_id as number,
							payFlags: { totalFee: 2000 },
							appArgs: [DAOActions.EXECUTE],
							accounts: [lsig.address()],
						},
						{
							type: types.TransactionType.TransferAlgo,
							sign: types.SignType.LogicSignature,
							fromAccountAddr: daoFundLsig.address(),
							toAccountAddr: this.walletStore.address, // proposer address
							amountMicroAlgos: 2e6,
							lsig: daoFundLsig,
							payFlags: { totalFee: 0 }, // fee must be paid by proposer
						},
					];
					try {
						await this.walletStore.webMode.executeTx(executeParams);
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
