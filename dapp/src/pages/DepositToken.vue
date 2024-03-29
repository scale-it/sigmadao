<template>
	<description :content="TOKEN_DESCRIPTION"></description>
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
				:labelWrap="true"
				name="DepositToken"
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

				<a-form-item :wrapper-col="{ offset: 12, span: 20 }">
					<a-button type="primary" html-type="submit">Deposit</a-button>
				</a-form-item>
			</a-form>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import {
	openSuccessNotificationWithIcon,
	VALIDATE_MESSAGES,
	overallErrorCheck,
	loadingMessage,
	errorMessage,
	successMessage,
	depositTokenMessage,
	SUCCESSFUL,
	TOKEN_DESCRIPTION,
} from "@/constants";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import { types } from "@algo-builder/web";
import { getApplicationAddress } from "algosdk";
import { defineComponent, reactive, toRaw } from "vue";
import VoteStore from "../store/VoteStore";
import { DAOActions } from "../types/enum.types";
import { searchApplicationAndAccount } from "@/indexer";
import Description from "@/UIKit/Description.vue";

export default defineComponent({
	name: "DepositToken",
	components: {
		Description,
	},
	data() {
		return {
			error: "",
			key: "DepositKey",
			TOKEN_DESCRIPTION,
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
			this.error = overallErrorCheck();
			if (!this.error) {
				loadingMessage(this.key);
				console.log(
					`* Deposit ${this.formState.deposit_amt} votes by ${this.walletStore.address} *`
				);

				const depositVoteParam: types.ExecParams[] = [
					// tx0: call to DAO App with arg 'DEPOSIT_TOKEN'
					{
						type: types.TransactionType.CallApp,
						sign: types.SignType.SecretKey,
						fromAccount: {
							addr: this.walletStore.address,
							sk: new Uint8Array(0),
						},
						appID: this.daoIDStore.dao_id as number,
						payFlags: { totalFee: 1000 },
						appArgs: [DAOActions.DEPOSIT_VOTE_TOKEN],
					},
					// tx1: deposit votes (each token == 1 vote)
					{
						type: types.TransactionType.TransferAsset,
						sign: types.SignType.SecretKey,
						fromAccount: {
							addr: this.walletStore.address,
							sk: new Uint8Array(0),
						},
						toAccountAddr: getApplicationAddress(
							this.daoIDStore.dao_id as number
						),
						amount: this.formState.deposit_amt as number,
						assetID: this.daoIDStore.govt_id as number,
						payFlags: { totalFee: 1000 },
					},
				];
				try {
					await toRaw(this.walletStore.webMode).executeTx(depositVoteParam);
					searchApplicationAndAccount(); // to update locked and available token on UI
					successMessage(this.key);
					openSuccessNotificationWithIcon(
						SUCCESSFUL,
						depositTokenMessage.SUCCESSFUL(this.formState.deposit_amt as number)
					);
					this.formState.$reset();
				} catch (error) {
					this.error = error.message;
					errorMessage(this.key);
					console.error("Transaction Failed", error);
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
