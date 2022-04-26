<template>
	<a-row>
		<a-col :span="12" :offset="6">
			<div v-if="error">
				<a-alert message="Error" :description="error" type="error" show-icon />
			</div>
			<a-form
				:label-col="{ span: 12 }"
				:wrapper-col="{ span: 12 }"
				:model="formState"
				name="Vote"
				autocomplete="off"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
				@validate-messages="validateMessages"
			>
				<a-form-item
					label="Deposit Amount"
					name="deposit_amt"
					:rules="[{ required: true, type: 'number' }]"
				>
					<a-input-number v-model:value="formState.deposit_amt" />
				</a-form-item>
				<a-form-item
					label="Vote"
					name="vote_type"
					:rules="[{ required: true }]"
				>
					<a-select
						v-model:value="formState.vote_type"
						placeholder="Please select your option"
					>
						<a-select-option :value="VoteOptions.ABSTAIN"
							>Abstain</a-select-option
						>
						<a-select-option :value="VoteOptions.YES">Yes</a-select-option>
						<a-select-option :value="VoteOptions.NO">No</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item :wrapper-col="{ offset: 10, span: 20 }">
					<a-button type="primary" html-type="submit">Submit</a-button>
				</a-form-item>
			</a-form>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import { VALIDATE_MESSAGES } from "@/constants/constant";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import { types } from "@algo-builder/web";
import { getApplicationAddress, LogicSigAccount } from "algosdk";
import { defineComponent, reactive } from "vue";
import VoteStore from "../store/VoteStore";
import { VoteOptions } from "../types/enum.types";
import { getProposalLsig } from "../contract/dao";
import { optInToApp } from "@/utility";
import { isAssetOpted } from "@/indexer";

export default defineComponent({
	name: "AddProposal",
	data() {
		return {
			VoteOptions,
			error: "",
		};
	},
	setup() {
		const formState = reactive(VoteStore());
		const daoIDStore = reactive(DaoID());
		const walletStore = reactive(WalletStore());
		return {
			formState,
			daoIDStore,
			walletStore,
			validateMessages: VALIDATE_MESSAGES,
		};
	},
	methods: {
		async onFinish() {
			if (typeof this.daoIDStore.dao_id === "undefined") {
				this.error = "Please add DAO App ID";
				setTimeout(() => {
					this.error = "";
				}, 2000);
				return;
			}
			if (typeof this.daoIDStore.govt_id === "undefined") {
				this.error = "Govt token not found";
				setTimeout(() => {
					this.error = "";
				}, 2000);
				return;
			}
			if (!this.walletStore.address.length) {
				this.error = "Please connect to your Wallet";
				setTimeout(() => {
					this.error = "";
				}, 2000);
				return;
			}
			let lsig: LogicSigAccount = await getProposalLsig(
				this.daoIDStore.dao_id,
				this.walletStore.address
			);
			// check if asset is already opted
			const isAssetAlreadyOpted = await isAssetOpted(
				this.walletStore.address,
				this.daoIDStore.govt_id
			);
			if (!isAssetAlreadyOpted) {
				// opt in lsig to app if not already opted
				const execParam: types.ExecParams = {
					type: types.TransactionType.OptInToApp,
					sign: types.SignType.LogicSignature,
					fromAccountAddr: lsig.address(),
					lsig: lsig,
					appID: this.daoIDStore.dao_id,
					payFlags: {},
				};
				optInToApp(lsig, execParam, this.walletStore.webMode);
			}

			console.log(
				`* Deposit ${this.formState.deposit_amt} votes by ${this.walletStore.address} *`
			);

			const depositVoteParam: types.ExecParams[] = [
				// tx0: call to DAO App with arg 'deposit_vote_token'
				{
					type: types.TransactionType.CallApp,
					sign: types.SignType.SecretKey,
					fromAccount: {
						addr: this.walletStore.address,
						sk: new Uint8Array(0),
					},
					appID: this.daoIDStore.dao_id,
					payFlags: { totalFee: 1000 },
					appArgs: ["str:deposit_vote_token"],
				},
				// tx1: deposit votes (each token == 1 vote)
				{
					type: types.TransactionType.TransferAsset,
					sign: types.SignType.SecretKey,
					fromAccount: {
						addr: getApplicationAddress(this.daoIDStore.dao_id),
						sk: new Uint8Array(0),
					},
					toAccountAddr: getApplicationAddress(this.daoIDStore.dao_id),
					amount: this.formState.deposit_amt as number,
					assetID: this.daoIDStore.govt_id,
					payFlags: { totalFee: 1000 },
				},
			];

			try {
				await this.walletStore.webMode.executeTransaction(depositVoteParam);
			} catch (error) {
				this.error = error.message;
				setTimeout(() => {
					this.error = "";
				}, 5000);
				console.error("Transaction Failed", error);
			}

			console.log(`* Register votes by ${this.walletStore.address} *`);
			// call to DAO app by voter (to register deposited votes)
			const registerVoteParam: types.ExecParams = {
				type: types.TransactionType.CallApp,
				sign: types.SignType.SecretKey,
				fromAccount: {
					addr: this.walletStore.address,
					sk: new Uint8Array(0),
				},
				appID: this.daoIDStore.dao_id,
				payFlags: { totalFee: 2000 },
				appArgs: ["str:register_vote", `str:${this.formState.vote_type}`],
				accounts: [lsig.address()],
			};
			try {
				await this.walletStore.webMode.executeTransaction(registerVoteParam);
			} catch (error) {
				this.error = error.message;
				setTimeout(() => {
					this.error = "";
				}, 5000);
				console.error("Transaction Failed", error);
			}
		},
		onFinishFailed(errorinfo: Event) {
			console.warn("Failed:", errorinfo);
		},
	},
});
</script>

<style></style>
