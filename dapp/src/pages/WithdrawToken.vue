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
	openSuccessNotificationWithIcon,
	overallErrorCheck,
	SUCCESSFUL,
	successMessage,
	VALIDATE_MESSAGES,
	withdrawTokenMessage,
	TOKEN_DESCRIPTION,
} from "@/constants";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import { types } from "@algo-builder/web";
import { defineComponent, reactive, toRaw } from "vue";
import VoteStore from "../store/VoteStore";
import { DAOActions } from "../types/enum.types";
import { searchApplicationAndAccount } from "@/indexer";
import Description from "@/UIKit/Description.vue";

export default defineComponent({
	name: "WithdrawToken",
	components: {
		Description,
	},
	data() {
		return {
			error: "",
			key: "WithdrawKey",
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
					`* Withrawing ${this.formState.deposit_amt} votes by ${this.walletStore.address} *`
				);

				const withdrawVoteParam: types.ExecParams = {
					type: types.TransactionType.CallApp,
					sign: types.SignType.SecretKey,
					fromAccount: {
						addr: this.walletStore.address,
						sk: new Uint8Array(0),
					},
					appID: this.daoIDStore.dao_id as number,
					payFlags: { totalFee: 2000 },
					appArgs: [
						DAOActions.WITHDRAW_VOTE_DEPOSIT,
						`int:${this.formState.withdraw_amt}`,
					],
					foreignAssets: [this.daoIDStore.govt_id as number],
				};

				try {
					await toRaw(this.walletStore.webMode).executeTx([withdrawVoteParam]);
					searchApplicationAndAccount(); // to update locked and available token on UI
					successMessage(this.key);
					openSuccessNotificationWithIcon(
						SUCCESSFUL,
						withdrawTokenMessage.SUCCESSFUL(
							this.formState.withdraw_amt as number
						)
					);
					this.formState.$reset();
				} catch (error) {
					errorMessage(this.key);
					this.error = error.message;
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
