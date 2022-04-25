<template>
	<a-row>
		<a-col :span="12" :offset="6">
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
					name="proposal_address"
					:rules="[
						{
							required: true,
						},
					]"
				>
					<a-input v-model:value="formState.proposal_address" />
				</a-form-item>
				<a-form-item
					label="Proposal ID"
					name="proposal_id"
					:rules="[{ required: true, type: 'number' }]"
				>
					<a-input-number v-model:value="formState.proposal_id" />
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
import { DAY_TO_MILLISECONDS, VALIDATE_MESSAGES } from "@/constants/constant";
import { DateRange } from "@/types";
import { defineComponent, reactive } from "vue";
import ProposalStore from "../store/ProposalStore";
import { ProposalType } from "../constants/constant";
import WalletStore from "../store/WalletStore";
import DaoID from "../store/DaoID";
import { types, tx as webTx, mkTxParams } from "@algo-builder/web";
import type { LogicSigAccount } from "algosdk";
import algodClient from "@/config/algob.config";
import * as algosdk from "algosdk";
import { getProposalLsig, getDaoFundLSig } from "../contract/dao";
import { isAssetOpted } from "../indexer";
import { fundAmount } from "../utility";
const { getApplicationAddress } = require("algosdk");

export default defineComponent({
	name: "AddProposal",
	data() {
		return {
			ProposalType,
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
					from,
					proposal_address,
					proposal_id,
					recipient,
					url,
					url_hash,
					proposal_type,
					vote_date,
					message,
					asaId,
				} = values;
				if (typeof this.daoStore.dao_id === "undefined") {
					console.error("appId not defined");
					return;
				}
				if (typeof this.daoStore.govt_id === "undefined") {
					console.error("govt_id not defined");
					return;
				}
				let lsig: LogicSigAccount = await getProposalLsig(
					this.daoStore.dao_id,
					this.walletStore.address
				);
				let daoLsig: LogicSigAccount = await getDaoFundLSig(
					this.daoStore.dao_id
				);
				const startTime = new Date(vote_date[0]).getTime() / 1000;
				const endTime = new Date(vote_date[1]).getTime() / 1000;
				const executeBefore = new Date(vote_date[1]).getTime() / 1000 + 7 * 60;
				let asa_id = this.daoStore.govt_id;

				switch (proposal_type) {
					case ProposalType.ALGO_TRANSFER: {
						break;
					}
					case ProposalType.ASA_TRANSFER: {
						asa_id = asaId;
						break;
					}
					case ProposalType.MESSAGE: {
						recipient = this.walletStore.address;
						amount = 2e6;
						break;
					}
				}
				// check if asset is already opted
				const isAssetAlreadyOpted = await isAssetOpted(
					this.walletStore.address,
					asa_id
				);
				if (!isAssetAlreadyOpted) {
					// opt in lsig to app
					this.optInLsigToApp(lsig);
				}
				const proposalParams = [
					`str:add_proposal`,
					`str:my-custom-proposal`, // name
					`str:${url}`, // url
					`str:${url_hash}`, // url_hash
					"str:", // hash_algo (passing null)
					`str:${message}`,
					`int:${startTime}`, // voting_start
					`int:${endTime}`, // voting_end
					`int:${executeBefore}`, // execute_before
					`int:${proposal_type}`, // type
					`addr:${daoLsig.address()}`, // from (DAO treasury)
					`addr:${recipient}`, // recepient
					`int:${amount}`, // amount (in microalgos)
				];
				const addProposalTx: types.ExecParams[] = [
					{
						type: types.TransactionType.CallApp,
						sign: types.SignType.LogicSignature,
						fromAccountAddr: lsig.address(),
						appID: this.daoStore.dao_id,
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
						assetID: asa_id,
						payFlags: { totalFee: 1000 },
					},
				];
				let response = await this.walletStore.webMode.executeTx(addProposalTx);
				console.log(response);
			} catch (error) {
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
					console.log("appId not defined");
					return;
				}
				if (typeof this.daoStore.govt_id === "undefined") {
					console.log("govt_id not defined");
					return;
				}
				// fund lsig
				fundAmount(
					this.walletStore.address,
					lsig.address(),
					2e6,
					this.walletStore.webMode
				);
				// optin to lsig
				const params = await mkTxParams(algodClient, {});
				const execParam: types.ExecParams = {
					type: types.TransactionType.OptInToApp,
					sign: types.SignType.LogicSignature,
					fromAccountAddr: lsig.address(),
					lsig: lsig,
					appID: this.daoStore.dao_id,
					payFlags: {},
				};
				const optInLsigToAppTx = await webTx.mkTransaction(execParam, params);
				const rawLsigSignedTx = algosdk.signLogicSigTransactionObject(
					optInLsigToAppTx,
					lsig
				).blob;
				const txInfo = await algodClient
					.sendRawTransaction(rawLsigSignedTx)
					.do();
				let optInResponse = await this.walletStore.webMode.waitForConfirmation(
					txInfo.txId
				);
				console.log("optInResponse: ", optInResponse);
			} catch (error) {
				console.error(error);
			}
		},
	},
});
</script>
