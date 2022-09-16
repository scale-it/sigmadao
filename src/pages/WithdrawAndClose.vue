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
		</a-col>
	</a-row>
	<a-row :gutter="[20, 20]" type="flex" justify="start">
		<a-col :xs="{ span: 24 }" :lg="{ span: 12 }">
			<a-card title="Withdraw the bond">
				<p>{{ WITHDRAW_FROM_PROPOSAL_DESCRIPTION }}</p>
				<a-button
					:disabled="checkWithdrawAndCloseValidity()"
					type="primary"
					@click="withdrawTokens"
					>Withdraw</a-button
				>
			</a-card>
		</a-col>
		<a-col :xs="{ span: 24 }" :lg="{ span: 12 }">
			<a-card title="Close Proposal">
				<p>{{ CLOSE_PROPOSAL_DESCRIPTION }}</p>
				<a-button
					:disabled="checkWithdrawAndCloseValidity()"
					type="primary"
					@click="handleCloseProposal"
					>Close</a-button
				>
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
	SUCCESSFUL,
	successMessage,
	UNSUCCESSFUL,
	VALIDATE_MESSAGES,
	withdrawTokenMessage,
	CLOSE_PROPOSAL_DESCRIPTION,
	WITHDRAW_FROM_PROPOSAL_DESCRIPTION,
} from "@/constants";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import { types } from "@algo-builder/web";
import { defineComponent, reactive, toRaw } from "vue";
import { searchApplicationAndAccount } from "@/indexer";
import ProposalStore from "@/store/ProposalStore";
import { LogicSigAccount } from "algosdk/dist/types/src/logicsig";
import { getProposalLsig } from "@/contract/dao";
import { closeProposal } from "@/utility";
import moment from "moment";

export default defineComponent({
	name: "WithdrawAndClose",
	data() {
		return {
			error: "",
			key: "WithdrawAndCloseKey",
			CLOSE_PROPOSAL_DESCRIPTION,
			WITHDRAW_FROM_PROPOSAL_DESCRIPTION,
		};
	},

	setup() {
		const daoIDStore = reactive(DaoID());
		const walletStore = reactive(WalletStore());
		const proposalStore = reactive(ProposalStore());
		const currentTime = moment(new Date()).unix();
		return {
			daoIDStore,
			walletStore,
			validateMessages: VALIDATE_MESSAGES,
			proposalStore,
			currentTime,
		};
	},
	methods: {
		errorDescription() {
			if (this.proposalStore.voting_end > this.currentTime) {
				return "Voting period has not yet finished.";
			}
		},
		checkWithdrawAndCloseValidity() {
			// it’s past execution: proposal.executed == 1  || proposal.execute_before < now
			if (
				this.proposalStore.executed === 1 ||
				this.proposalStore.execute_before < this.currentTime
			) {
				return true;
			}
			return false;
		},
		async withdrawTokens() {
			const proposalLsig: LogicSigAccount = await getProposalLsig(
				this.daoIDStore.dao_id as number,
				this.walletStore.address
			);
			loadingMessage(this.key);
			const minimumDepositToken = this.daoIDStore.global_app_state?.get(
				GLOBAL_STATE_MAP_KEY.Deposit
			);
			console.log(
				`* Withrawing from proposalLsig ${minimumDepositToken} amount by ${this.walletStore.address} *`
			);
			// can only be withdrawn if the curent user is the proposer
			if (proposalLsig.address() === this.proposalStore.proposal_addr) {
				try {
					const withdrawParam: types.ExecParams = {
						type: types.TransactionType.TransferAsset,
						sign: types.SignType.LogicSignature,
						fromAccountAddr: proposalLsig.address(),
						toAccountAddr: this.walletStore.address,
						amount: minimumDepositToken as number,
						lsig: proposalLsig,
						assetID: this.daoIDStore.govt_id as number,
						payFlags: { totalFee: 1000 },
					};
					try {
						const response = await toRaw(this.walletStore.webMode).executeTx([
							withdrawParam,
						]);
						console.log("withdraw from proposal", response);
						searchApplicationAndAccount(); // to update locked and available token on UI
						successMessage(this.key);
						openSuccessNotificationWithIcon(
							SUCCESSFUL,
							withdrawTokenMessage.SUCCESSFUL(minimumDepositToken as number)
						);
					} catch (error) {
						errorMessage(this.key);
						this.error = error.message;
						console.error("Transaction Failed", error);
					}
				} catch (error) {
					openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
				}
			} else {
				openErrorNotificationWithIcon(
					UNSUCCESSFUL,
					"Only creator of the proposal can withdraw from the proposal."
				);
			}
		},
		async handleCloseProposal() {
			const proposalLsig: LogicSigAccount = await getProposalLsig(
				this.daoIDStore.dao_id as number,
				this.walletStore.address
			);
			loadingMessage(this.key);
			// checking if the requestor is proposal creator
			if (proposalLsig.address() === this.proposalStore.proposal_addr) {
				try {
					await closeProposal(
						this.walletStore.address,
						proposalLsig,
						this.daoIDStore.govt_id as number,
						this.daoIDStore.dao_id as number,
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
