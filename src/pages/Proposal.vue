<template>
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
			<a-form-item label="Vote" name="vote_type" :rules="[{ required: true }]">
				<a-select
					v-model:value="formState.vote_type"
					placeholder="Please select your type"
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
				<a-form-item label="From" name="from" :rules="[{ required: true }]">
					<a-input v-model:value="formState.from" />
				</a-form-item>
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
			<div class="flexBox" v-if="formState.vote_type === ProposalType.ASA">
				<a-form-item
					label="ASA ID"
					name="asaId"
					:rules="[{ required: true, type: 'number' }]"
				>
					<a-input-number v-model:value="formState.asaId" />
				</a-form-item>
			</div>
			<div class="flexBox" v-if="formState.vote_type === ProposalType.MESSAGE">
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
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
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
		const formState = ProposalStore();

		const onFinish = (values: Event) => {
			console.log("Success:", values);
		};
		const onFinishFailed = (errorinfo: Event) => {
			console.warn("Failed:", errorinfo);
		};
		// eslint-disable-next-line
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
		// eslint-disable-next-line
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
			required: "required!",
			types: {
				url: "It is not a valid url!",
				number: "It is is not a valid number!",
			},
		};
		const headerHeight = document.getElementById("header")?.offsetHeight;

		return {
			formState,
			disabledDate,
			disabledRangeTime,
			onFinish,
			onFinishFailed,
			headerHeight,
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
</style>
