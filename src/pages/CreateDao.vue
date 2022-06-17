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
					label="Token Asset Index"
					name="token_id"
					:rules="[{ required: true, type: 'number' }]"
				>
					<a-input-number v-model:value="formState.token_id" />
				</a-form-item>
				<a-form-item
					label="Minimum Deposit Amount"
					name="min_deposit_amt"
					:rules="[{ required: true, type: 'number' }]"
				>
					<a-input-number v-model:value="formState.min_deposit_amt" />
				</a-form-item>
				<a-form-item
					label="Minimum Support"
					name="min_support"
					:rules="[{ required: true, type: 'number' }]"
				>
					<a-input-number v-model:value="formState.min_support" />
				</a-form-item>
				<a-form-item
					label="Minimum Duration"
					name="min_duration"
					:rules="[{ required: true, type: 'number' }]"
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
					:rules="[{ required: true, type: 'number' }]"
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
				>
					<a-input v-model:value="formState.url" />
				</a-form-item>
				<a-form-item
					label="DAO Name"
					name="dao_name"
					:rules="[{ required: true }]"
				>
					<a-input v-model:value="formState.dao_name" />
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
	DAY_TO_SECONDS,
	errorMessage,
	HOUR_TO_SECONDS,
	loadingMessage,
	MINUTE_TO_SECONDS,
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
import { getCompiledDaoApproval } from "@/contract/dao/dao-app-approval";
import { getCompiledDaoClear } from "@/contract/dao/dao-app-clear";

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
		convertToSeconds(type: DurationType, value: number): number {
			switch (type) {
				case DurationType.DAYS:
					return value * DAY_TO_SECONDS;
				case DurationType.HOURS:
					return value * HOUR_TO_SECONDS;
				case DurationType.MINUTES:
					return value * MINUTE_TO_SECONDS;
				case DurationType.SECONDS:
					return value;
				default:
					return value;
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
				min_duration = this.convertToSeconds(
					this.minDurationInputType,
					min_duration
				);
			}
			if (max_duration) {
				max_duration = this.convertToSeconds(
					this.maxDurationInputType,
					max_duration
				);
			}

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
