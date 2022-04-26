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
				name="WithdrawToken"
				autocomplete="off"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
				@validate-messages="validateMessages"
			>
				<a-form-item
					label="Withdraw Amount"
					name="withdraw_amt"
					:rules="[{ required: true, type: 'number' }]"
				>
					<a-input-number v-model:value="formState.withdraw_amt" />
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
import { getApplicationAddress } from "algosdk";
import { defineComponent, reactive } from "vue";
import VoteStore from "../store/VoteStore";
import { DAOActions } from "../types/enum.types";
import { isApplicationOpted, searchApplicationAndAccount } from "@/indexer";

export default defineComponent({
	name: "WithdrawToken",
	data() {
		return {
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

			console.log(
				`* Withrawing ${this.formState.deposit_amt} votes by ${this.walletStore.address} *`
			);

			const withdrawVoteParam: types.ExecParams = {
				type: types.TransactionType.CallApp,
				sign: types.SignType.SecretKey,
				fromAccount: {
					addr: this.walletStore.address,
					sk: new Uint8Array(0),
				},
				appID: this.daoIDStore.dao_id,
				payFlags: { totalFee: 2000 },
				appArgs: [
					DAOActions.WITHDRAW_VOTE_DEPOSIT,
					`int:${this.formState.withdraw_amt}`,
				],
				foreignAssets: [this.daoIDStore.govt_id],
			};

			try {
				await this.walletStore.webMode.executeTx(withdrawVoteParam);
				searchApplicationAndAccount(); // to update locked and available token on UI
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
