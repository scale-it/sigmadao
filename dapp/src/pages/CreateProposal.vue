<template>
	<a-breadcrumb class="margin_bottom_sm">
		<a-breadcrumb-item
			><a @click="redirectToAllProposal">All Proposals</a></a-breadcrumb-item
		>
		<a-breadcrumb-item>Create Proposal</a-breadcrumb-item>
	</a-breadcrumb>
	<a-row>
		<a-col>
			<h3>Current DAO conditions</h3>
			<a-descriptions size="small" bordered :column="{ xs: 1, sm: 3 }">
				<a-descriptions-item label="Minimum deposit amount of the gov tokens"
					>{{ globalStateMinAmount }} tokens
				</a-descriptions-item>
				<a-descriptions-item label="Maximum Duration of voting period">{{
					toDaysMinutesSeconds(maxDuration)
				}}</a-descriptions-item>
				<a-descriptions-item label="Minimum Duration of voting period">{{
					toDaysMinutesSeconds(minDuration)
				}}</a-descriptions-item>
			</a-descriptions>
		</a-col>
	</a-row>
	<a-row class="margin_top_large">
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
				:label-col="{ span: 10 }"
				:wrapper-col="{ span: 12 }"
				:model="formState"
				name="Add Proposal"
				autocomplete="off"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
				@validate-messages="validateMessages"
			>
				<a-form-item
					label="Name"
					name="proposal_name"
					:rules="[{ required: true }]"
				>
					<a-input v-model:value="formState.proposal_name" />
				</a-form-item>
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
					:rules="[{ required: true, validator: validateVotingDates }]"
				>
					<a-range-picker
						format="YYYY-MM-DD HH:mm"
						value-format="YYYY-MM-DD HH:mm"
						:disabled-date="disabledDate"
						:disabled-time="disabledRangeTime"
						showTime
						v-model:value="formState.vote_date"
					/>
				</a-form-item>
				<a-form-item
					label="Execute Before"
					name="execute_before"
					:rules="[{ required: true, validator: validateExecuteBefore }]"
				>
					<a-date-picker
						v-model:value="formState.execute_before"
						showTime
						format="YYYY-MM-DD HH:mm"
						value-format="YYYY-MM-DD HH:mm"
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
				<a-form-item
					label="Algos Amount to fund Lsig"
					name="lsig_fund_amount"
					:rules="[
						{
							required: true,
							type: 'number',
							validator: (rule, value) =>
								validateFundAmount(rule, value, lsig_fund_amount),
						},
					]"
				>
					<a-input-number v-model:value="lsig_fund_amount" />
				</a-form-item>
				<a-form-item :wrapper-col="{ offset: 10, span: 20 }">
					<a-button type="primary" html-type="submit">Create Proposal</a-button>
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
	openErrorNotificationWithIcon,
	UNSUCCESSFUL,
	GLOBAL_STATE_MAP_KEY,
	DEFAULT_FUND_AMT,
} from "@/constants";
import { DateRange, DAOActions, EndPoint } from "@/types";
import { defineComponent, reactive, toRaw } from "vue";
import ProposalFormStore from "../store/AddProposalStore";
import WalletStore from "../store/WalletStore";
import DaoID from "../store/DaoID";
import { types } from "@algo-builder/web";
import type { LogicSigAccount } from "algosdk";
import { algosToMicroalgos } from "algosdk";
import { getProposalLsig, getDaoFundLSig } from "../contract/dao";
import { isApplicationOpted, searchApplicationAndAccount } from "@/indexer";
import {
	fundAmount,
	convertToSeconds,
	getDifferenceInSeconds,
	toDaysMinutesSeconds,
	redirectTo,
	validateFundAmount,
	optInASAToAccount,
} from "../utility";
import DaoStore from "../store/DaoID";
import ProposalTableStore from "../store/ProposalTableStore";
import { Rule } from "ant-design-vue/lib/form";
const { getApplicationAddress } = require("algosdk");

export default defineComponent({
	name: "AddProposal",
	data() {
		return {
			ProposalType,
			error: "",
			key: "AddProposalKey",
			DaoStore,
			lsig_fund_amount: DEFAULT_FUND_AMT,
		};
	},
	setup() {
		const formState = reactive(ProposalFormStore());
		const walletStore = reactive(WalletStore());
		const proposalDataStore = reactive(ProposalTableStore());
		const daoStore = reactive(DaoID());
		const maxDuration = daoStore.global_app_state?.get(
			GLOBAL_STATE_MAP_KEY.MaxDuration
		) as number;

		const minDuration = daoStore.global_app_state?.get(
			GLOBAL_STATE_MAP_KEY.MinDuration
		) as number;
		const globalStateMinAmount =
			daoStore.global_app_state?.get(GLOBAL_STATE_MAP_KEY.Deposit) ?? 15; //  minimun deposit amount taken from dao app global state
		return {
			formState,
			walletStore,
			daoStore,
			validateMessages: VALIDATE_MESSAGES,
			proposalDataStore,
			maxDuration,
			minDuration,
			globalStateMinAmount,
			toDaysMinutesSeconds,
			validateFundAmount,
		};
	},
	methods: {
		redirectToAllProposal() {
			redirectTo(this.$router, EndPoint.PROPOSALS);
		},
		//  execute_before must be after voting_end
		async validateExecuteBefore(_rule: Rule, value: string) {
			if (value === null) {
				return Promise.reject("Please input execute before time.");
			} else {
				if (
					this.formState.execute_before !== undefined &&
					this.formState.vote_date !== undefined &&
					this.formState.vote_date?.[1]?.length
				) {
					const execute_before = convertToSeconds(
						this.formState.execute_before
					);
					const voting_end = convertToSeconds(this.formState.vote_date[1]);
					if (execute_before <= voting_end) {
						return Promise.reject(
							"Execute before must be after voting end time."
						);
					} else return Promise.resolve();
				}
				return Promise.resolve();
			}
		},
		//	proposal vote time >= min duration and <= max duration
		async validateVotingDates(_rule: Rule, value: string) {
			if (value === null) {
				return Promise.reject("Please input voting dates.");
			} else {
				if (
					this.formState.vote_date !== undefined &&
					this.formState.vote_date?.[0]?.length &&
					this.formState.vote_date?.[1]?.length
				) {
					const votingStart = convertToSeconds(this.formState.vote_date[0]);
					const votingEnd = convertToSeconds(this.formState.vote_date[1]);
					const diffInSeconds = getDifferenceInSeconds(votingStart, votingEnd);
					if (
						this.minDuration > diffInSeconds ||
						diffInSeconds > this.maxDuration
					) {
						return Promise.reject(
							`Voting duration must be at least ${toDaysMinutesSeconds(
								this.minDuration
							)} and atmost ${toDaysMinutesSeconds(this.maxDuration)}.`
						);
					}
					// voting_end must be > voting_start
					if (votingEnd < votingStart) {
						return Promise.reject(
							"Voting end date must be after the start date."
						);
					}
				}
				return Promise.resolve();
			}
		},
		async optInLsigToDao(lsig: LogicSigAccount) {
			const isAppOpted = await isApplicationOpted(
				lsig.address(),
				this.daoStore.dao_id as number
			);

			if (!isAppOpted) {
				const execParam: types.ExecParams = {
					type: types.TransactionType.OptInToApp,
					sign: types.SignType.LogicSignature,
					fromAccountAddr: lsig.address(),
					lsig: lsig,
					appID: this.daoStore.dao_id as number,
					payFlags: { totalFee: 1000 },
				};
				const response = await toRaw(this.walletStore.webMode).executeTx([
					execParam,
				]);
				console.log("optin :", response);
			}
		},
		async onFinish(values: any) {
			try {
				let {
					proposal_name,
					amount,
					recipient,
					url,
					url_hash,
					proposal_type,
					vote_date,
					message,
					asaId,
					execute_before,
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
					const executeBefore = convertToSeconds(execute_before);
					// Default proposal params. Other params are added based on proposal type in below switch case.
					const proposalParams = [
						DAOActions.ADD_PROPOSAL,
						`str:${proposal_name}`, // proposal name
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
								`int:${algosToMicroalgos(amount)}` // amount in microalgos
							);
							break;
						}
						case ProposalType.ASA_TRANSFER: {
							proposalParams.push(
								`addr:${daoLsig.address()}`, // from
								`int:${asaId}`, // asaId
								`addr:${recipient}`, // recipient
								`int:${algosToMicroalgos(amount)}` // amount in microalgos
							);
							break;
						}
						case ProposalType.MESSAGE: {
							proposalParams.push(`str:${message}`); // message
							break;
						}
					}
					await this.checkLsigFund(lsig);
					await this.optInLsigToDao(lsig);

					// check if min gov tokens required for tranfer are available with proposal creator
					if ((this.daoStore.available as number) < this.globalStateMinAmount) {
						this.error = `You have insufficient balance of available gov tokens, minimum tokens required for proposal is ${this.globalStateMinAmount}`;
						errorMessage(this.key);
						openErrorNotificationWithIcon(UNSUCCESSFUL, this.error);
						return;
					}
					const callAppTx: types.ExecParams = {
						type: types.TransactionType.CallApp,
						sign: types.SignType.LogicSignature,
						fromAccountAddr: lsig.address(),
						appID: this.daoStore.dao_id as number,
						lsig: lsig,
						payFlags: {},
						appArgs: proposalParams,
					};

					const transferAssetTx: types.ExecParams = {
						type: types.TransactionType.TransferAsset,
						sign: types.SignType.SecretKey,
						fromAccount: {
							addr: this.walletStore.address,
							sk: new Uint8Array(0),
						},
						toAccountAddr: getApplicationAddress(this.daoStore.dao_id),
						amount: this.globalStateMinAmount as number,
						assetID: this.daoStore.govt_id as number,
						payFlags: { totalFee: 1000 },
					};
					let addProposalResponse = await toRaw(
						this.walletStore.webMode
					).executeTx([callAppTx, transferAssetTx]);
					console.log("Add Proposal txn response", addProposalResponse);
					await searchApplicationAndAccount(); // to update locked and available token on UI
					successMessage(this.key);
					openSuccessNotificationWithIcon(
						SUCCESSFUL,
						proposalMessage.SUCCESSFUL
					);
					// opt ASA into dao fund lsig
					if (proposal_type === ProposalType.ASA_TRANSFER) {
						await optInASAToAccount(
							daoLsig.address(),
							asaId,
							daoLsig,
							this.walletStore.webMode
						);
					}
					this.redirectToAllProposal();
					this.formState.$reset();
				}
			} catch (error) {
				this.error = error.message;
				errorMessage(this.key);
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
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
		// funding lsig if the account has no algos
		async checkLsigFund(lsig: LogicSigAccount) {
			try {
				await fundAmount(
					this.walletStore.address,
					lsig.address(),
					this.lsig_fund_amount * 1e6,
					this.walletStore.webMode
				);
			} catch (error) {
				this.error = error.message;
				errorMessage(this.key);
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
			}
		},
	},
});
</script>
