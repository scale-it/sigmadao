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
				:label-col="{ span: 10 }"
				:wrapper-col="{ span: 20 }"
				:model="formState"
				name="Add Proposal"
				autocomplete="off"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
				@validate-messages="validateMessages"
			>
				<a-form-item
					label="URL"
					name="url"
					:rules="[{ required: true, type: 'url' }]"
				>
					<a-input v-model:value="formState.url" />
				</a-form-item>
				<a-form-item
					label="URL Hash"
					name="url_hash"
					:rules="[{ required: true }]"
				>
					<a-input v-model:value="formState.url_hash" />
				</a-form-item>
				<a-form-item
					label="Proposal Account Address"
					name="proposalAddress"
					:rules="[
						{
							required: true,
						},
					]"
				>
					<a-input v-model:value="formState.proposalAddress" :disabled="true" />
				</a-form-item>
				<a-form-item
					label="Voting Date"
					name="vote_date"
					:rules="[{ required: true }]"
				>
					<a-range-picker
						format="YYYY-MM-DD HH:mm:ss"
						value-format="YYYY-MM-DD HH:mm:ss"
						:disabled-date="disabledDate"
						:disabled-time="disabledRangeTime"
						showTime
						v-model:value="formState.vote_date"
					/>
				</a-form-item>
				<a-form-item
					label="Proposal Type"
					name="proposal_type"
					:rules="[{ required: true }]"
				>
					<a-select
						v-model:value="formState.proposal_type"
						placeholder="Please select your vote type"
					>
						<a-select-option :value="ProposalType.ALGO_TRANSFER"
							>Algo Transfer</a-select-option
						>
						<a-select-option :value="ProposalType.ASA_TRANSFER"
							>ASA Transfer</a-select-option
						>
						<a-select-option :value="ProposalType.MESSAGE"
							>Message</a-select-option
						>
					</a-select>
				</a-form-item>
				<div
					class="flexBox"
					v-if="
						formState.proposal_type &&
						formState.proposal_type !== ProposalType.MESSAGE
					"
				>
					<a-form-item
						label="Recipient"
						name="recipient"
						:rules="[{ required: true }]"
					>
						<a-input v-model:value="formState.recipient" />
					</a-form-item>
					<a-form-item
						label="Amount"
						name="amount"
						:rules="[{ required: true, type: 'number' }]"
					>
						<a-input-number v-model:value="formState.amount" />
					</a-form-item>
				</div>
				<div
					class="flexBox"
					v-if="formState.proposal_type === ProposalType.ASA_TRANSFER"
				>
					<a-form-item
						label="ASA ID"
						name="asaId"
						:rules="[{ required: true, type: 'number' }]"
					>
						<a-input-number v-model:value="formState.asaId" />
					</a-form-item>
				</div>
				<div
					class="flexBox"
					v-if="formState.proposal_type === ProposalType.MESSAGE"
				>
					<a-form-item
						label="Message"
						name="message"
						:rules="[{ required: true }]"
					>
						<a-input v-model:value="formState.message" />
					</a-form-item>
				</div>
				<a-form-item :wrapper-col="{ offset: 10, span: 20 }">
					<a-button type="primary" html-type="submit">Submit</a-button>
				</a-form-item>
			</a-form>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import {
	DAY_TO_MILLISECONDS,
	VALIDATE_MESSAGES,
	ProposalType,
	openSuccessNotificationWithIcon,
	overallErrorCheck,
	loadingMessage,
	successMessage,
	errorMessage,
	proposalMessage,
	SUCCESSFUL,
} from "@/constants";
import { DateRange, DAOActions } from "@/types";
import { defineComponent, reactive } from "vue";
import ProposalStore from "../store/ProposalStore";
import WalletStore from "../store/WalletStore";
import DaoID from "../store/DaoID";
import { types } from "@algo-builder/web";
import type { LogicSigAccount } from "algosdk";
import { getProposalLsig, getDaoFundLSig } from "../contract/dao";
import { fundAmount, convertToSeconds, optInToApp } from "../utility";
import { APP_NOT_FOUND, TOKEN_NOT_FOUND } from "@/constants";
import { isApplicationOpted } from "@/indexer";
const { getApplicationAddress } = require("algosdk");

export default defineComponent({
	name: "AddProposal",
	data() {
		return {
			ProposalType,
			error: "",
			key: "ProposalKey",
		};
	},
	setup() {
		const formState = reactive(ProposalStore());
		const walletStore = reactive(WalletStore());
		const daoStore = reactive(DaoID());

		return {
			formState,
			walletStore,
			daoStore,
			validateMessages: VALIDATE_MESSAGES,
		};
	},
	methods: {
		async onFinish(values: any) {
			try {
				let {
					amount,
					recipient,
					url,
					url_hash,
					proposal_type,
					vote_date,
					message,
					asaId,
				} = values;
				this.error = overallErrorCheck();
				if (!this.error) {
					loadingMessage(this.key);
					let lsig: LogicSigAccount = await getProposalLsig(
						this.daoStore.dao_id as number,
						this.walletStore.address
					);
					let daoLsig: LogicSigAccount = await getDaoFundLSig(
						this.daoStore.dao_id as number
					);
					const startTime = convertToSeconds(vote_date[0]);
					const endTime = convertToSeconds(vote_date[1]);
					const executeBefore = endTime + 7 * 60; // end time + 7 minutes in seconds

					// Default proposal params. Other params are added based on proposal type in below switch case.
					const proposalParams = [
						DAOActions.ADD_PROPOSAL,
						`str:my-custom-proposal`, // name
						`str:${url}`, // url
						`str:${url_hash}`, // url_hash
						"str:", // hash_algo (passing null)
						`int:${startTime}`, // voting_start
						`int:${endTime}`, // voting_end
						`int:${executeBefore}`, // execute_before
						`int:${proposal_type}`, // type
					];

					switch (proposal_type) {
						case ProposalType.ALGO_TRANSFER: {
							proposalParams.push(
								`addr:${daoLsig.address()}`, // from
								`addr:${recipient}`, // recipient
								`int:${amount}` // amount
							);
							break;
						}
						case ProposalType.ASA_TRANSFER: {
							proposalParams.push(
								`addr:${daoLsig.address()}`, // from
								`int:${asaId}`, // asaId
								`addr:${recipient}`, // recipient
								`int:${amount}` // amount
							);
							break;
						}
						case ProposalType.MESSAGE: {
							proposalParams.push(`str:${message}`); // message
							break;
						}
					}

					// check if asset is already opted
					const isApplicationAlreadyOpted = await isApplicationOpted(
						this.walletStore.address,
						this.daoStore.dao_id as number
					);
					// optin
					if (!isApplicationAlreadyOpted) {
						await this.optInLsigToApp(lsig);
					}
					const addProposalTx: types.ExecParams[] = [
						{
							type: types.TransactionType.CallApp,
							sign: types.SignType.LogicSignature,
							fromAccountAddr: lsig.address(),
							appID: this.daoStore.dao_id as number,
							lsig: lsig,
							payFlags: {},
							appArgs: proposalParams,
						},
						{
							type: types.TransactionType.TransferAsset,
							sign: types.SignType.SecretKey,
							fromAccount: {
								addr: this.walletStore.address,
								sk: new Uint8Array(0),
							},
							toAccountAddr: getApplicationAddress(this.daoStore.dao_id),
							amount: 15,
							assetID: this.daoStore.govt_id as number,
							payFlags: {},
						},
					];
					let response = await this.walletStore.webMode.executeTx(
						addProposalTx
					);
					successMessage(this.key);
					openSuccessNotificationWithIcon(
						SUCCESSFUL,
						proposalMessage.SUCCESSFUL
					);
					console.log(response);
				}
			} catch (error) {
				errorMessage(this.key);
				console.error(error);
			}
		},
		onFinishFailed(errorinfo: Event) {
			console.warn("Failed:", errorinfo);
		},
		disabledDate(current: number | Date) {
			// Can not select day before today
			return (
				current &&
				current < new Date(new Date().valueOf() - DAY_TO_MILLISECONDS)
			);
		},
		range(start: number, end: number) {
			const result = [];

			for (let i = start; i < end; i++) {
				result.push(i);
			}

			return result;
		},
		// eslint-disable-next-line
		disabledRangeTime(_: any, type: DateRange) {
			if (type === "start") {
				return {
					disabledHours: () => this.range(0, 60).splice(4, 20),
					disabledMinutes: () => this.range(30, 60),
					disabledSeconds: () => [55, 56],
				};
			}
		},
		async optInLsigToApp(lsig: LogicSigAccount) {
			try {
				if (typeof this.daoStore.dao_id === "undefined") {
					this.error = APP_NOT_FOUND;
					return;
				}
				if (typeof this.daoStore.govt_id === "undefined") {
					this.error = TOKEN_NOT_FOUND;
					return;
				}
				// fund lsig
				await fundAmount(
					this.walletStore.address,
					lsig.address(),
					2e6,
					this.walletStore.webMode
				);
				// optin to app
				const execParam: types.ExecParams = {
					type: types.TransactionType.OptInToApp,
					sign: types.SignType.LogicSignature,
					fromAccountAddr: lsig.address(),
					lsig: lsig,
					appID: this.daoStore.dao_id,
					payFlags: {},
				};
				let response = await optInToApp(lsig, execParam);
				console.log(response);
			} catch (error) {
				errorMessage(this.key);
				console.error(error);
			}
		},
	},
});
</script>
