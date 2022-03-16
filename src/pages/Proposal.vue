<template>
	<div
		class="header_margin"
		:style="'--p-height: ' + headerHeight + 'px'"
	></div>
	<div class="mt flexBox flexBox_center">
		<form @submit="onSubmit">
			<label for="url">URL</label>
			<input id="url" required v-model="formState.url" type="url" />
			<label for="url_hash">URL Hash</label>
			<input id="url_hash" required v-model="formState.url_hash" />
			<label for="proposal_address">Proposal Account Address</label>
			<input
				id="proposal_address"
				required
				v-model="formState.proposal_address"
			/>
			<label for="url">Proposal ID</label>
			<input id="url" required v-model="formState.proposal_id" />
			<label for="voting_date">Voting Date</label>
			<a-range-picker
				id="voting_date"
				format="YYYY-MM-DD HH:mm:ss"
				value-format="YYYY-MM-DD HH:mm:ss"
				:disabled-date="disabledDate"
				:disabled-time="disabledRangeTime"
				showTime
				v-model:value="formState.vote_date"
				style="border-color: black"
			/>
			<label for="vote_options">Vote</label>
			<select
				name="vote_type"
				id="vote_options"
				required
				v-model="formState.vote_type"
			>
				<option :value="ProposalType.ALGO">Algo Transfer</option>
				<option :value="ProposalType.ASA">ASA Transfer</option>
				<option :value="ProposalType.MESSAGE">Message</option>
			</select>
			<div
				class="flexBox"
				v-if="
					formState.vote_type && formState.vote_type !== ProposalType.MESSAGE
				"
			>
				<label for="from"> From</label>
				<input id="from" v-model="formState.from" required />

				<label for="recipient">Recipient</label>
				<input id="recipient" v-model="formState.recipient" />

				<label for="amount"> Amount </label>
				<input id="amount" v-model="formState.amount" />
			</div>
			<div class="flexBox" v-if="formState.vote_type === ProposalType.ASA">
				<label for="asa_id">ASA ID</label>
				<input id="asa_id" v-model="formState.asaId" />
			</div>
			<div class="flexBox" v-if="formState.vote_type === ProposalType.MESSAGE">
				<label for="message">Message</label>
				<input id="message" v-model="formState.message" />
			</div>
			<button type="submit" class="submit_btn" @click="onSubmit">Submit</button>
		</form>
	</div>
</template>

<script lang="ts">
import { ProposalFormState } from "@/types";
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
	setup() {
		const store = ProposalStore();
		const formState = reactive<ProposalFormState>(store.$state);

		const onSubmit = () => {
			let success = false;
			if (
				!formState.vote_type ||
				!formState.url ||
				!formState.url_hash ||
				!formState.vote_date ||
				!formState.proposal_address
			) {
				success = false;
			} else {
				switch (formState.vote_type) {
					case ProposalType.ASA:
						return (success = formState.asaId ? true : false);
					case ProposalType.MESSAGE:
						return (success = formState.message ? true : false);
					default:
						return (success =
							formState.from || formState.recipient || formState.amount
								? true
								: false);
				}
			}

			success && store.setFormValue(formState);
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

		const headerHeight = document.getElementById("header")?.offsetHeight;
		return {
			formState,
			disabledDate,
			disabledRangeTime,
			onSubmit,
			headerHeight,
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
