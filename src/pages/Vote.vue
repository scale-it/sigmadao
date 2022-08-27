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
					<a-button class="margin_extra_sm" type="primary" html-type="submit"
						>Vote</a-button
					>
					<a-button
						class="margin_extra_sm"
						type="primary"
						danger
						@click="clearVote()"
						>Clear Vote Record</a-button
					>
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
	voteMessage,
} from "@/constants";
import DaoID from "@/store/DaoID";
import WalletStore from "@/store/WalletStore";
import { types } from "@algo-builder/web";
import { defineComponent, reactive } from "vue";
import VoteStore from "../store/VoteStore";
import { DAOActions, VoteOptions } from "../types/enum.types";
import ProposalStore from "@/store/ProposalStore";
import { clearVoteRecord } from "@/utility";

export default defineComponent({
	name: "VotePage",
	data() {
		return {
			VoteOptions,
			error: "",
			key: "VoteKey",
		};
	},
	setup() {
		const formState = reactive(VoteStore());
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
		async clearVote() {
			try {
				await clearVoteRecord(
					this.proposalStore.selected_address,
					this.walletStore.address,
					this.daoIDStore.dao_id as number,
					this.walletStore.webMode
				);
				openSuccessNotificationWithIcon(
					SUCCESSFUL,
					`Your vote record has been cleared from ${this.proposalStore.name} proposal.`
				);
			} catch (error) {
				openErrorNotificationWithIcon(UNSUCCESSFUL, error);
			}
		},
		async onFinish() {
			this.error = overallErrorCheck();
			if (!this.error) {
				loadingMessage(this.key);
				const proposalAddress = this.proposalStore.selected_address;
				console.log(`* Register votes by ${this.walletStore.address} *`);
				// call to DAO app by voter (to register deposited votes)
				const registerVoteParam: types.ExecParams = {
					type: types.TransactionType.CallApp,
					sign: types.SignType.SecretKey,
					fromAccount: {
						addr: this.walletStore.address,
						sk: new Uint8Array(0),
					},
					appID: this.daoIDStore.dao_id as number,
					payFlags: { totalFee: 2000 },
					appArgs: [
						DAOActions.REGISTER_VOTE,
						`str:${this.formState.vote_type}`,
					],
					accounts: [proposalAddress],
				};
				try {
					await this.walletStore.webMode.executeTx([registerVoteParam]);
					openSuccessNotificationWithIcon(SUCCESSFUL, voteMessage.SUCCESSFUL);
					successMessage(this.key);
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
