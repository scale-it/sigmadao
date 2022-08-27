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
			<a-form
				:label-col="{ span: 12 }"
				:wrapper-col="{ span: 12 }"
				:model="formState"
				name="WithdrawFromProposal"
				autocomplete="off"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
				@validate-messages="validateMessages"
			>
				<a-form-item
					label="Withdraw From Proposal"
					name="withdraw_amt"
					:rules="[{ required: true, type: 'number' }]"
				>
					<a-input-number v-model:value="formState.withdraw_amt" />
				</a-form-item>

				<a-form-item :wrapper-col="{ offset: 12, span: 20 }">
					<a-button type="primary" html-type="submit">Withdraw</a-button>
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
	withdrawTokenMessage,
} from "@/constants";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import { types } from "@algo-builder/web";
import { defineComponent, reactive } from "vue";
import { searchApplicationAndAccount } from "@/indexer";
import ProposalStore from "@/store/ProposalStore";
import {  LogicSigAccount } from "algosdk/dist/types/src/logicsig";
import { getProposalLsig } from "@/contract/dao";

export default defineComponent({
	name: "WithdrawFromProposal",
	data() {
		return {
			error: "",
			key: "WithdrawFromProposalKey",
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
		};
	},
	methods: {
		async onFinish() {
			this.error = overallErrorCheck();
			if (!this.error) {
				loadingMessage(this.key);
				console.log(
					`* Withrawing from proposalLsig ${this.formState.withdraw_amt} amount by ${this.walletStore.address} *`
				);
				const lsig: LogicSigAccount = await getProposalLsig(
					this.daoIDStore.dao_id as number,
					this.walletStore.address
				);
				// can only be withdrawn if the curent user is the proposer
				if (lsig.address() === this.proposalStore.selected_address) {
					try {
						const withdrawParam: types.ExecParams = {
							type: types.TransactionType.TransferAsset,
							sign: types.SignType.LogicSignature,
							fromAccountAddr: lsig.address(),
							toAccountAddr: this.walletStore.address,
							amount: this.formState.withdraw_amt,
							lsig: lsig,
							assetID: this.daoIDStore.govt_id as number,
							payFlags: { totalFee: 1000 },
						};
						try {
							await this.walletStore.webMode.executeTx([withdrawParam]);
							searchApplicationAndAccount(); // to update locked and available token on UI
							successMessage(this.key);
							openSuccessNotificationWithIcon(
								SUCCESSFUL,
								withdrawTokenMessage.SUCCESSFUL(
									this.formState.withdraw_amt as number
								)
							);
						} catch (error) {
							errorMessage(this.key);
							this.error = error.message;
							console.error("Transaction Failed", error);
						}
					} catch (error) {
						openErrorNotificationWithIcon(UNSUCCESSFUL, error);
					}
				} else {
					openErrorNotificationWithIcon(
						UNSUCCESSFUL,
						"Only creator of the proposal can close the proposal."
					);
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
