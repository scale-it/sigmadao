<template>
	<a-row>
		<a-col :span="12" :offset="6">
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
				name="Vote"
				autocomplete="off"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
				@validate-messages="validateMessages"
			>
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
				<a-form-item :wrapper-col="{ offset: 12, span: 20 }">
					<a-button type="primary" html-type="submit">Submit</a-button>
				</a-form-item>
			</a-form>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import {
	APP_NOT_FOUND,
	openSuccessNotificationWithIcon,
	TOKEN_NOT_FOUND,
	VALIDATE_MESSAGES,
	WALLET_NOT_CONNECT,
} from "@/constants";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import { types } from "@algo-builder/web";
import { LogicSigAccount } from "algosdk";
import { defineComponent, reactive } from "vue";
import VoteStore from "../store/VoteStore";
import { DAOActions, VoteOptions } from "../types/enum.types";
import { getProposalLsig } from "../contract/dao";

export default defineComponent({
	name: "VotePage",
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
				this.error = APP_NOT_FOUND;
				return;
			}
			if (typeof this.daoIDStore.govt_id === "undefined") {
				this.error = TOKEN_NOT_FOUND;
				return;
			}
			if (!this.walletStore.address.length) {
				this.error = WALLET_NOT_CONNECT;
				return;
			}
			let lsig: LogicSigAccount = await getProposalLsig(
				this.daoIDStore.dao_id,
				this.walletStore.address // need to update it as per proposer address
			);

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
				appArgs: [DAOActions.REGISTER_VOTE, `str:${this.formState.vote_type}`],
				accounts: [lsig.address()],
			};
			try {
				await this.walletStore.webMode.executeTx([registerVoteParam]);
				openSuccessNotificationWithIcon("Success", "Your vote is registered ");
			} catch (error) {
				this.error = error.message;
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
