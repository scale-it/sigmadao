<template>
	<div
		class="header_margin"
		:style="'--p-height: ' + headerHeight + 'px'"
	></div>
	<div class="mt flexBox flexBox_center">
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
				name="URL"
				:rules="[{ required: true, type: 'url' }]"
			>
				<a-input v-model:value="formState.url" />
			</a-form-item>
			<a-form-item
				label="URL Hash"
				name="URL Hash"
				:rules="[{ required: true }]"
			>
				<a-input v-model:value="formState.url_hash" />
			</a-form-item>
			<a-form-item
				label="Proposal Account Address"
				name="Proposal Account Address"
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
				name="Proposal ID"
				:rules="[{ required: true, type: 'number' }]"
			>
				<a-input v-model:value="formState.proposal_id" />
			</a-form-item>
			<a-form-item
				label="Voting Date"
				name="Voting Date"
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
			<a-form-item label="Vote">
				<a-select
					v-model:value="formState.vote_type"
					placeholder="Please select your type"
					:rules="[{ required: true }]"
				>
					<a-select-option :value="ProposalType.ALGO"
						>Algo Transfer</a-select-option
					>
					<a-select-option :value="ProposalType.ASA"
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
					formState.vote_type && formState.vote_type !== ProposalType.MESSAGE
				"
			>
				<a-form-item label="From" name="From" :rules="[{ required: true }]">
					<a-input v-model="formState.from" />
				</a-form-item>
				<a-form-item
					label="Recipient"
					name="Recipient"
					:rules="[{ required: true }]"
				>
					<a-input v-model="formState.recipient" />
				</a-form-item>
				<a-form-item
					label="Amount"
					name="Amount"
					:rules="[{ required: true, type: 'number' }]"
				>
					<a-input v-model="formState.amount" />
				</a-form-item>
			</div>
			<div class="flexBox" v-if="formState.vote_type === ProposalType.ASA">
				<a-form-item
					label="ASA ID"
					name="ASA ID"
					:rules="[{ required: true, type: 'number' }]"
				>
					<a-input v-model="formState.asaId" />
				</a-form-item>
			</div>
			<div class="flexBox" v-if="formState.vote_type === ProposalType.MESSAGE">
				<a-form-item
					label="Message"
					name="Message"
					:rules="[{ required: true }]"
				>
					<a-input v-model="formState.message" />
				</a-form-item>
			</div>
			<a-form-item :wrapper-col="{ offset: 8, span: 16 }">
				<a-button type="primary" html-type="submit">Submit</a-button>
			</a-form-item>
		</a-form>
	</div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import ProposalStore from "../store/ProposalStore";
import { ProposalType } from "../types/enum.types";

export default defineComponent({
	name: "AddProposal",
	data() {
		return {
			ProposalType,
		};
	},
	setup() {
		const showError = ref(false);
		const formState = ProposalStore();
		const onFinish = (values: any) => {
			console.log("Success:", values);
		};
		const onFinishFailed = (errorinfo: any) => {
			console.log("failed:", errorinfo);
		};
		const disabledDate = (current: any) => {
			// Can not select day before today
			return (
				current &&
				current < new Date(new Date().valueOf() - 1000 * 60 * 60 * 24)
			);
		};

		const range = (start: number, end: number) => {
			const result = [];

			for (let i = start; i < end; i++) {
				result.push(i);
			}

			return result;
		};

		const disabledRangeTime = (_: any, type: "start" | "end") => {
			if (type === "start") {
				return {
					disabledHours: () => range(0, 60).splice(4, 20),
					disabledMinutes: () => range(30, 60),
					disabledSeconds: () => [55, 56],
				};
			}
		};

		const validateMessages = {
			required: "${label} is required!",
			types: {
				url: "${label} is not a valid url!",
				number: "${label} is not a valid number!",
			},
		};
		const headerHeight = document.getElementById("header")?.offsetHeight;

		formState.$subscribe((mutation, state) => {
			formState.setFormValue(state);
		});

		return {
			formState,
			disabledDate,
			disabledRangeTime,
			onFinish,
			onFinishFailed,
			headerHeight,
			showError,
			validateMessages,
		};
	},
});
</script>

<style>
.mt {
	margin-top: 20px;
}
.flexBox {
	display: flex;
	flex-direction: column;
}
.flexBox_center {
	justify-content: center;
	align-items: center;
}

.header_margin {
	padding: 10px;
	top: 0;
	left: 0;
	width: 1400px;
	height: var(--p-height);
}
</style>
