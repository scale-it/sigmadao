<template>
	<a-breadcrumb>
		<a-breadcrumb-item
			><a @click="redirectToAllDao">All Dao</a></a-breadcrumb-item
		>
		<a-breadcrumb-item>Create Dao</a-breadcrumb-item>
	</a-breadcrumb>

	<h3 class="text_center">Create DAO</h3>
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
				:label-col="{ span: 10 }"
				:wrapper-col="{ span: 12 }"
				layout="horizontal"
				:model="formState"
				name="Create"
				autocomplete="off"
				:labelWrap="true"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
				@validate-messages="validateMessages"
			>
				<a-form-item
					name="token_id"
					:rules="[{ required: true, type: 'number' }]"
				>
					<template #label>
						<div class="margin_right_extra_sm">Gov Token ID</div>
						<info-tool-tip
							data="ASA that will define Gov DAO token membership."
						/>
					</template>
					<a-input-number v-model:value="formState.token_id" />
				</a-form-item>
				<a-form-item
					name="min_deposit_amt"
					:rules="[{ required: true, type: 'number' }]"
				>
					<template #label>
						<div class="margin_right_extra_sm">Minimum Deposit Amount</div>
						<info-tool-tip
							data="Minimum deposit amount of the gov tokens required to make a proposal."
						/>
					</template>
					<a-input-number v-model:value="formState.min_deposit_amt" />
				</a-form-item>
				<a-form-item
					name="min_support"
					:rules="[{ required: true, type: 'number' }]"
				>
					<template #label>
						<div class="margin_right_extra_sm">Minimum Support</div>
						<info-tool-tip
							data="Minimum number of yes token votes to validate the proposal."
						/>
					</template>
					<a-input-number v-model:value="formState.min_support" />
				</a-form-item>
				<a-form-item
					name="min_duration"
					:rules="[{ required: true, type: 'number' }]"
				>
					<template #label>
						<div class="margin_right_extra_sm">Minimum Duration</div>
						<info-tool-tip data="Minimum voting time for a new proposal." />
					</template>
					<a-form-item-rest>
						<a-radio-group
							class="margin_bottom_sm"
							v-model:value="minDurationInputType"
						>
							<a-radio :value="DurationType.DAYS">Days</a-radio>
							<a-radio :value="DurationType.HOURS">Hours</a-radio>
						</a-radio-group>
					</a-form-item-rest>
					<a-input-number v-model:value="formState.min_duration" />
				</a-form-item>
				<a-form-item
					name="max_duration"
					:rules="[
						{ required: true, type: 'number', validator: validateMaxDuration },
					]"
				>
					<template #label>
						<div class="margin_right_extra_sm">Maximum Duration</div>
						<info-tool-tip data="Maximum voting time for a new proposal." />
					</template>
					<a-form-item-rest>
						<a-radio-group
							class="margin_bottom_sm"
							v-model:value="maxDurationInputType"
						>
							<a-radio :value="DurationType.DAYS">Days</a-radio>
							<a-radio :value="DurationType.HOURS">Hours</a-radio>
						</a-radio-group>
					</a-form-item-rest>
					<a-input-number v-model:value="formState.max_duration" />
				</a-form-item>
				<a-form-item name="url" :rules="[{ required: true, type: 'url' }]">
					<template #label>
						<div class="margin_right_extra_sm">URL</div>
						<info-tool-tip
							data="Website with more information about the DAO."
						/>
					</template>
					<a-input v-model:value="formState.url" />
				</a-form-item>
				<a-form-item
					label="DAO Name"
					name="dao_name"
					:rules="[{ required: true }]"
				>
					<a-input maxlength="32" v-model:value="formState.dao_name" />
				</a-form-item>
				<a-form-item
					label="Algos amount to fund DAO Account"
					name="dao_acc_fund_amount"
				>
					<a-input-number v-model:value="dao_acc_fund_amount" />
				</a-form-item>
				<a-form-item
					label="Algos amount fund DAO Lsig"
					name="dao_lsig_fund_amount"
				>
					<a-input-number v-model:value="dao_lsig_fund_amount" />
				</a-form-item>
				<a-form-item :wrapper-col="{ offset: 10, span: 20 }">
					<a-button type="primary" html-type="submit">Create DAO</a-button>
				</a-form-item>
			</a-form>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import {
	createDaoMessage,
	DAO_CONTRACT_STATE_CONFIG,
	DEFAULT_FUND_AMT,
	errorMessage,
	loadingMessage,
	openErrorNotificationWithIcon,
	openSuccessNotificationWithIcon,
	SUCCESSFUL,
	successMessage,
	UNSUCCESSFUL,
	VALIDATE_MESSAGES,
} from "@/constants";
import WalletStore from "@/store/WalletStore";
import { types } from "@algo-builder/web";
import { defineComponent, reactive } from "vue";
import CreateDAOStore from "../store/CreateDaoStore";
import {
	DurationType,
	CreateDaoFormState,
	EndPoint,
	DAOActions,
} from "@/types";
import { ExecParams, MetaType } from "@algo-builder/web/build/types";
import {
	getCompiledDaoApproval,
	getCompiledDaoClear,
	getDaoFundLSig,
} from "@/contract/dao";
import { Rule } from "ant-design-vue/lib/form";
import { convertDurationTypeToSeconds, redirectTo } from "@/utility";
import { getAssetInformation } from "@/indexer";
import InfoToolTip from "../components/InfoToolTip.vue";
import { getApplicationAddress, LogicSigAccount } from "algosdk";
import { ConfirmedTxInfo } from "@algo-builder/algob/build/types";

export default defineComponent({
	name: "CreateDaoPage",
	components: {
		InfoToolTip,
	},
	data() {
		return {
			error: "",
			key: "CreateDaoKey",
			minDurationInputType: DurationType.HOURS,
			maxDurationInputType: DurationType.HOURS,
			DurationType,
			EndPoint,
			dao_lsig_fund_amount: DEFAULT_FUND_AMT,
			dao_acc_fund_amount: DEFAULT_FUND_AMT,
		};
	},
	setup() {
		const formState = reactive(CreateDAOStore());
		const walletStore = reactive(WalletStore());
		return {
			formState,
			CreateDAOStore,
			walletStore,
			validateMessages: VALIDATE_MESSAGES,
		};
	},
	methods: {
		async validateMaxDuration(_rule: Rule, value: string) {
			if (value === null) {
				return Promise.reject("Please input the maximum duration.");
			} else {
				if (
					this.formState.max_duration !== undefined &&
					this.formState.min_duration !== undefined
				) {
					const max_duration = convertDurationTypeToSeconds(
						this.maxDurationInputType,
						this.formState.max_duration
					);
					const min_duration = convertDurationTypeToSeconds(
						this.minDurationInputType,
						this.formState.min_duration
					);
					if (max_duration < min_duration) {
						return Promise.reject(
							"Maximum duration for voting should be alteast equal to minumum duration"
						);
					} else return Promise.resolve();
				}
				return Promise.resolve();
			}
		},
		async onFinish(value: CreateDaoFormState) {
			let {
				token_id,
				min_deposit_amt,
				min_support,
				min_duration,
				max_duration,
				url,
				dao_name,
			} = value;

			if (min_duration) {
				min_duration = convertDurationTypeToSeconds(
					this.minDurationInputType,
					min_duration
				);
			}
			if (max_duration) {
				max_duration = convertDurationTypeToSeconds(
					this.maxDurationInputType,
					max_duration
				);
			}
			await getAssetInformation(token_id as number).catch((error) => {
				this.error = `Please enter a valid Gov Token ID. ${token_id} Gov Token ID doesn't exists`;
				throw error;
			});

			loadingMessage(this.key);
			const deployApp: types.DeployAppParam[] = [
				{
					type: types.TransactionType.DeployApp,
					sign: types.SignType.SecretKey,
					fromAccount: {
						addr: this.walletStore.address,
						sk: new Uint8Array(0),
					},
					appDefinition: {
						appName: dao_name as string,
						metaType: MetaType.BYTES,
						approvalProgramBytes: await getCompiledDaoApproval(),
						clearProgramBytes: await getCompiledDaoClear(),
						...DAO_CONTRACT_STATE_CONFIG,
						foreignAssets: [token_id as number],
						appArgs: [
							`int:${min_deposit_amt}`,
							`int:${min_support}`,
							`int:${min_duration}`,
							`int:${max_duration}`,
							`str:${url}`,
							`str:${dao_name}`,
							`int:${token_id}`,
						],
					},
					payFlags: {},
				},
			];

			try {
				const response = (await this.walletStore.webMode.executeTx(
					deployApp
				)) as unknown as ConfirmedTxInfo;

				const daoId = response?.["application-index"];
				let daoLsig: LogicSigAccount = await getDaoFundLSig(daoId as number);

				// Fund application account with some ALGO(5)
				const fundAppParameters: ExecParams = {
					type: types.TransactionType.TransferAlgo,
					sign: types.SignType.SecretKey,
					fromAccount: {
						addr: this.walletStore.address,
						sk: new Uint8Array(0),
					},
					toAccountAddr: getApplicationAddress(daoId),
					amountMicroAlgos: this.dao_acc_fund_amount * 1e6,
					payFlags: { totalFee: 1000 },
				};

				// opt in deposit account (dao app account) to gov_token asa so as to recieve gov tokens in future(like add_proposal, vote token, etc)
				const optInToGovASAParam: ExecParams = {
					type: types.TransactionType.CallApp,
					sign: types.SignType.SecretKey,
					fromAccount: {
						addr: this.walletStore.address,
						sk: new Uint8Array(0),
					},
					appID: daoId,
					payFlags: { totalFee: 2000 },
					foreignAssets: [token_id as number],
					appArgs: [DAOActions.OPT_IN_GOV_TOKEN],
				};

				const fundLsigParam: ExecParams = {
					type: types.TransactionType.TransferAlgo,
					sign: types.SignType.SecretKey,
					fromAccount: {
						addr: this.walletStore.address,
						sk: new Uint8Array(0),
					},
					toAccountAddr: daoLsig.address(),
					amountMicroAlgos: this.dao_lsig_fund_amount * 1e6,
					payFlags: {},
				};

				const optInDaoLsigParam: types.ExecParams = {
					type: types.TransactionType.OptInASA,
					sign: types.SignType.LogicSignature,
					fromAccountAddr: daoLsig.address(),
					lsig: daoLsig,
					assetID: this.formState.token_id as number,
					payFlags: {},
				};

				await this.walletStore.webMode.executeTx([
					fundAppParameters,
					optInToGovASAParam,
					fundLsigParam,
					optInDaoLsigParam,
				]);

				successMessage(this.key);
				openSuccessNotificationWithIcon(
					SUCCESSFUL,
					createDaoMessage.SUCCESSFUL
				);
				this.redirectToAllDao();
			} catch (error) {
				this.error = error.message;
				errorMessage(this.key);
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
				console.error("Transaction Failed", error);
			}
		},
		redirectToAllDao() {
			redirectTo(this.$router, EndPoint.ALL_DAO);
		},
		onFinishFailed(errorinfo: Event) {
			console.warn("Failed:", errorinfo);
		},
	},
});
</script>

<style></style>
