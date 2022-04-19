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
					label="Vote"
					name="vote_type"
					:rules="[{ required: true }]"
				>
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
				<div
					class="flexBox"
					v-if="formState.vote_type === ProposalType.MESSAGE"
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
import { ProposalType } from "../types/enum.types";

export default defineComponent({
	name: "AddProposal",
	data() {
		return {
			ProposalType,
		};
	},
	methods: {
		onFinish(values: Event) {
			console.log("Success:", values);
		},
		onFinishFailed(errorinfo: Event) {
			console.warn("Failed:", errorinfo);
		},
		disabledDate(current: any) {
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
	},
	setup() {
		const formState = reactive(ProposalStore());
		return {
			formState,
			validateMessages: VALIDATE_MESSAGES,
		};
	},
});
</script>
