<template>
	<a-row>
		<a-col :xs="{ offset: 1 }" :lg="{ offset: 15 }">
			<a-radio-group
				v-model:value="this.proposalStore.filterType"
				name="radioGroup"
				@change="handlePagination(PaginationCallType.FIRST_PAGE)"
			>
				<a-radio
					v-for="item in radioGroupData"
					:key="item.id"
					:value="item.value"
					>{{ ProposalFilterType[item.value] }}</a-radio
				>
			</a-radio-group>
		</a-col>
	</a-row>
	<div class="table_container">
		<a-table
			:dataSource="dataSource"
			:columns="columns"
			bordered
			:pagination="false"
		>
			<template #title>
				<a-col>
					<h3 style="text-align: center">Available Proposals</h3>
				</a-col>
			</template>
			<template #bodyCell="{ record, column }">
				<template v-if="column.key === 'name'">
					<a :href="'//' + record.url" target="_blank">
						{{ record.name }}
					</a>
				</template>
				<template v-if="column.key === 'voting_start'">
					{{
						secToFormat(record.voting_start, DateTimeFormat.DAY_TIME_WITH_DAY) +
						" - " +
						secToFormat(record.voting_end, DateTimeFormat.DAY_TIME_WITH_DAY)
					}}
				</template>
				<template v-if="column.key === 'type'">
					{{ ProposalType[record.type] }}
				</template>
				<template v-if="column.key === 'action'">
					<a-button type="link" @click="() => handleSelectProposal(record)">
						Use
					</a-button>
					<a-button
						type="link"
						danger
						@click="() => handleCloseProposal(record)"
					>
						Close
					</a-button>
				</template>
			</template>
		</a-table>
	</div>
	<a-col :offset="15">
		<TablePagination
			v-bind:totalDataRowsCount="totalDataRowsCount"
			:paginationHandler="handlePagination"
		/>
	</a-col>
</template>

<script lang="ts">
import {
	VALIDATE_MESSAGES,
	openErrorNotificationWithIcon,
	UNSUCCESSFUL,
	ROWS_PER_PAGE,
	ProposalType,
	PROPOSAL_LOCAL_STATE_MAP_KEY,
} from "@/constants";
import {
	ProposalTableData,
	PaginationCallType,
	ProposalFilterType,
	DateTimeFormat,
} from "@/types";
import { defineComponent, reactive, ref } from "vue";
import DaoID from "../store/DaoID";
import ProposalTableStore from "../store/ProposalTableStore";
import { secToFormat } from "../utility";
import { decodeProposalParams } from "@/indexer";
import TablePagination from "../UIKit/TablePagination.vue";
import {
	executeReq,
	searchProposalsByAppIdReq,
	getProposalCursorReq,
} from "@/api";

export default defineComponent({
	name: "ProposalTable",
	components: {
		TablePagination,
	},
	data() {
		return {
			key: "ProposalKey",
			columns: [
				{
					title: "Proposal Name",
					key: PROPOSAL_LOCAL_STATE_MAP_KEY.Name,
					dataIndex: PROPOSAL_LOCAL_STATE_MAP_KEY.Name,
				},
				{
					title: "Proposal Type",
					key: PROPOSAL_LOCAL_STATE_MAP_KEY.Type,
					dataIndex: PROPOSAL_LOCAL_STATE_MAP_KEY.Type,
				},
				{
					title: "Voting Start - Voting End",
					key: PROPOSAL_LOCAL_STATE_MAP_KEY.Voting_Start,
					dataIndex: PROPOSAL_LOCAL_STATE_MAP_KEY.Voting_Start,
				},
				{
					title: "Action",
					key: "action",
				},
			],
			radioGroupData: [
				{
					id: 1,
					value: ProposalFilterType.All,
				},
				{
					id: 2,
					value: ProposalFilterType.Ongoing,
				},
				{
					id: 3,
					value: ProposalFilterType.Active,
				},
				{
					id: 4,
					value: ProposalFilterType.Past,
				},
			],
			totalDataRowsCount: ROWS_PER_PAGE,
			ROWS_PER_PAGE,
			dataSource: [] as ProposalTableData[],
			currentPageCursor: {
				endCursor: null,
				startCursor: null,
			},
			PaginationCallType,
			ProposalType,
			DateTimeFormat,
			secToFormat,
		};
	},
	setup() {
		const proposalStore = reactive(ProposalTableStore());
		const daoStore = reactive(DaoID());

		return {
			proposalStore,
			daoStore,
			validateMessages: VALIDATE_MESSAGES,
			ProposalFilterType,
		};
	},
	methods: {
		handlePagination(type: PaginationCallType, pageNumber?: string) {
			switch (type) {
				case PaginationCallType.NAV_PREV:
					this.fetchProposalData(
						null,
						null,
						ROWS_PER_PAGE,
						this.currentPageCursor.startCursor
					);
					break;
				case PaginationCallType.NAV_NEXT:
					this.fetchProposalData(
						ROWS_PER_PAGE,
						this.currentPageCursor.endCursor,
						null,
						null
					);
					break;
				case PaginationCallType.JUMP_PAGE:
					this.handlePageJump(pageNumber as string);
					break;
				case PaginationCallType.FIRST_PAGE:
					this.fetchProposalData(ROWS_PER_PAGE, null, null, null, 1);
					break;
			}
		},
		async fetchProposalData(
			first: number | null,
			endCursor: string | null,
			last: number | null,
			startCursor: string | null,
			currentPage?: number
		) {
			const appId = this.daoStore.dao_id as number;
			const res = await executeReq(
				searchProposalsByAppIdReq(
					appId,
					this.proposalStore.filterType,
					first,
					endCursor,
					last,
					startCursor
				)
			).catch((error) =>
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message)
			);

			if (res?.sigmaDaosProposalFilter) {
				if (res.sigmaDaosProposalFilter.nodes.length) {
					// clean existing data in temp array with change of page
					if (this.dataSource.length) {
						this.dataSource = [];
					}
					res.sigmaDaosProposalFilter.nodes.map(
						async (item: any, index: number) => {
							let parsedData = await decodeProposalParams(item.localstate);
							parsedData["key"] = index; // for antd table
							this.dataSource.push(parsedData);
							console.log(parsedData);
							// pushing data to store only if it doesn't exists
							let isCached = false;
							isCached = this.proposalStore.psqlData.has(+item.appId);
							if (!isCached) {
								this.proposalStore.psqlData.set(+item.appId, parsedData);
							}
						}
					);
				} else {
					this.dataSource = [];
				}

				if (res.sigmaDaosProposalFilter.pageInfo) {
					const pageInfo = res.sigmaDaosProposalFilter.pageInfo;
					this.currentPageCursor.startCursor = pageInfo.startCursor;
					this.currentPageCursor.endCursor = pageInfo.endCursor;
				}

				this.totalDataRowsCount = res.sigmaDaosProposalFilter.totalCount;
			}
		},
		async handlePageJump(pageNumber: string) {
			if (+pageNumber === 1) {
				this.handlePagination(PaginationCallType.FIRST_PAGE);
			} else {
				await this.getCursorDetails(+pageNumber);
				this.handlePagination(PaginationCallType.NAV_NEXT);
			}
		},
		async getCursorDetails(pageNumber: number) {
			const appId = this.daoStore.dao_id as number;
			const cursorRes = await executeReq(
				getProposalCursorReq(
					appId,
					this.proposalStore.filterType,
					pageNumber,
					ROWS_PER_PAGE
				)
			).catch((error) =>
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message)
			);

			if (cursorRes.sigmaDaosProposalFilter.pageInfo ?? false) {
				const pageInfo = cursorRes.sigmaDaosProposalFilter.pageInfo;
				this.currentPageCursor.endCursor = pageInfo.endCursor;
				this.currentPageCursor.startCursor = pageInfo.startCursor;
			}
		},
		async handleSelectProposal() {
			console.log("Proposal Selected");
		},
		async handleCloseProposal(record: any) {
			console.log("closed", record);
		},
		async loadTable() {
			this.handlePagination(PaginationCallType.FIRST_PAGE);
		},
	},
	mounted() {
		this.proposalStore.loadTable = this.loadTable;
		this.loadTable();
	},
});
</script>
