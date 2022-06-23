<template>
	<a-row>
		<a-col :span="14" :offset="6">
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
				name="Create"
				autocomplete="off"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
				@validate-messages="validateMessages"
			>
				<a-form-item
					label="Gov Token ID"
					name="token_id"
					:rules="[{ required: true, type: 'number' }]"
					extra="ASA which will define Gov DAO token membership."
				>
					<a-input-number v-model:value="formState.token_id" />
				</a-form-item>
				<a-form-item
					label="Minimum Deposit Amount"
					name="min_deposit_amt"
					:rules="[{ required: true, type: 'number' }]"
					extra="Minimum deposit amount of the gov tokens required to make a proposal."
				>
					<a-input-number v-model:value="formState.min_deposit_amt" />
				</a-form-item>
				<a-form-item
					label="Minimum Support"
					name="min_support"
					:rules="[{ required: true, type: 'number' }]"
					extra="Minimum number of yes token votes to validate the proposal."
				>
					<a-input-number v-model:value="formState.min_support" />
				</a-form-item>
				<a-form-item
					label="Minimum Duration"
					name="min_duration"
					:rules="[{ required: true, type: 'number' }]"
					extra="Minimum voting time for a new proposal."
				>
					<a-form-item-rest>
						<a-radio-group
							class="margin_bottom_sm"
							v-model:value="minDurationInputType"
						>
							<a-radio :value="DurationType.DAYS">Days</a-radio>
							<a-radio :value="DurationType.HOURS">Hours</a-radio>
							<a-radio :value="DurationType.MINUTES">Minutes</a-radio>
							<a-radio :value="DurationType.SECONDS">Seconds</a-radio>
						</a-radio-group>
					</a-form-item-rest>
					<a-input-number v-model:value="formState.min_duration" />
				</a-form-item>
				<a-form-item
					label="Maximum Duration"
					name="max_duration"
					extra="Maximum voting time for a new proposal."
					:rules="[
						{ required: true, type: 'number', validator: validateMaxDuration },
					]"
				>
					<a-form-item-rest>
						<a-radio-group
							class="margin_bottom_sm"
							v-model:value="maxDurationInputType"
						>
							<a-radio :value="DurationType.DAYS">Days</a-radio>
							<a-radio :value="DurationType.HOURS">Hours</a-radio>
							<a-radio :value="DurationType.MINUTES">Minutes</a-radio>
							<a-radio :value="DurationType.SECONDS">Seconds</a-radio>
						</a-radio-group>
					</a-form-item-rest>
					<a-input-number v-model:value="formState.max_duration" />
				</a-form-item>
				<a-form-item
					label="URL"
					name="url"
					:rules="[{ required: true, type: 'url' }]"
					extra="Website with more information about the DAO."
				>
					<a-input v-model:value="formState.url" />
				</a-form-item>
				<a-form-item
					label="DAO Name"
					name="dao_name"
					:rules="[{ required: true }]"
				>
					<a-input maxlength="32" v-model:value="formState.dao_name" />
				</a-form-item>
				<a-form-item :wrapper-col="{ offset: 10, span: 20 }">
					<a-button type="primary" html-type="submit">Submit</a-button>
				</a-form-item>
			</a-form>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import {
	createDaoMessage,
	DAO_CONTRACT_STATE_CONFIG,
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
import { DurationType, CreateDaoFormState } from "@/types";
import { MetaType } from "@algo-builder/web/build/types";
import { getCompiledDaoApproval, getCompiledDaoClear } from "@/contract/dao";
import { Rule } from "ant-design-vue/lib/form";
import { convertDurationTypeToSeconds } from "@/utility";
import { getAssetInformation } from "@/indexer";

export default defineComponent({
	name: "CreateDaoPage",
	data() {
		return {
			error: "",
			key: "CreateDaoKey",
			minDurationInputType: DurationType.HOURS,
			maxDurationInputType: DurationType.HOURS,
			DurationType,
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
				await this.walletStore.webMode.executeTx(deployApp);
				openSuccessNotificationWithIcon(
					SUCCESSFUL,
					createDaoMessage.SUCCESSFUL
				);
				successMessage(this.key);
			} catch (error) {
				this.error = error.message;
				errorMessage(this.key);
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
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
