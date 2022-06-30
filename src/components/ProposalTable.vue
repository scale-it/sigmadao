<template>
	<div class="dao_table_container">
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
						secToFormat(record.voting_start, "lll") +
						" - " +
						secToFormat(record.voting_end, "lll")
					}}
				</template>
				<template v-if="column.key === 'type'">
					{{ ProposalType[record.type] }}
				</template>
			</template>
		</a-table>
	</div>
	<a-col :offset="15">
		<a-pagination
			:hideOnSinglePage="true"
			v-model:current="currentPage"
			:pageSize="ROWS_PER_PAGE"
			:total="totalDataRowsCount"
		>
			<template #itemRender="{ type, originalElement }">
				<a
					v-if="type === 'prev'"
					@click="handlePagination(PaginationCallType.NAV_PREV)"
					><left-outlined
				/></a>
				<a
					v-else-if="type === 'next'"
					@click="handlePagination(PaginationCallType.NAV_NEXT)"
					><right-outlined
				/></a>
				<component
					@click="
						handlePagination(
							PaginationCallType.JUMP_PAGE,
							originalElement.children[0].children
						)
					"
					:is="originalElement"
					v-else
				></component>
			</template>
		</a-pagination>
	</a-col>
</template>

<script lang="ts">
import {
	VALIDATE_MESSAGES,
	openErrorNotificationWithIcon,
	UNSUCCESSFUL,
	ROWS_PER_PAGE,
	ProposalType,
} from "@/constants";
import { ProposalTableData, PaginationCallType } from "@/types";
import { defineComponent, reactive, ref, toRefs } from "vue";
import DaoID from "../store/DaoID";
import ProposalTableStore from "../store/ProposalTableStore";
import { secToFormat } from "../utility";
import { decodeProposalParams } from "@/indexer";
import {
	executeReq,
	searchProposalsByAppIdReq,
	getProposalCursorReq,
} from "@/api";

export default defineComponent({
	name: "ProposalTable",
	data() {
		return {
			key: "ProposalKey",
			columns: [
				{
					title: "Proposal Name",
					key: "name",
					dataIndex: "name",
				},
				{
					title: "Proposal Type",
					key: "type",
					dataIndex: "type",
				},
				{
					title: "Message",
					key: "msg",
					dataIndex: "msg",
				},
				{
					title: "Voting Start - Voting End",
					key: "voting_start",
					dataIndex: "voting_start",
				},
				{
					title: "Action",
					key: "action",
				},
			],
			currentPage: ref(1),
			totalDataRowsCount: ROWS_PER_PAGE,
			ROWS_PER_PAGE,
			dataSource: [] as ProposalTableData[],
			currentPageCursor: {
				endCursor: null,
				startCursor: null,
			},
			PaginationCallType,
			ProposalType,
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
				searchProposalsByAppIdReq(appId, first, endCursor, last, startCursor)
			).catch((error) =>
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message)
			);

			if (res && res.searchSigmaDaosProposals) {
				if (res.searchSigmaDaosProposals.nodes.length) {
					// clean existing data in temp array with change of page
					if (this.dataSource.length) {
						this.dataSource = [];
					}
					res.searchSigmaDaosProposals.nodes.map(
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
				}

				if (res.searchSigmaDaosProposals.pageInfo) {
					const pageInfo = res.searchSigmaDaosProposals.pageInfo;
					this.currentPageCursor.startCursor = pageInfo.startCursor;
					this.currentPageCursor.endCursor = pageInfo.endCursor;
				}

				// setting it only at first call since it doesn't change i.e for page 1
				if (currentPage === 1 && res.searchSigmaDaosProposals.totalCount) {
					this.totalDataRowsCount = res.searchSigmaDaosProposals.totalCount;
				}
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
				getProposalCursorReq(appId, pageNumber, ROWS_PER_PAGE)
			).catch((error) =>
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message)
			);

			if (cursorRes.searchSigmaDaosProposals.pageInfo ?? false) {
				const pageInfo = cursorRes.searchSigmaDaosProposals.pageInfo;
				this.currentPageCursor.endCursor = pageInfo.endCursor;
				this.currentPageCursor.startCursor = pageInfo.startCursor;
			}
		},
	},
	mounted() {
		this.handlePagination(PaginationCallType.FIRST_PAGE);
	},
});
</script>
