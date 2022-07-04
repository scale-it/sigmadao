<template>
	<a-row>
		<a-col :xs="{ offset: 1 }" :lg="{ offset: 15 }">
			<a-radio-group
				v-model:value="this.proposalStore.filterType"
				name="radioGroup"
				@change="handleFilter"
			>
				<a-radio :value="ProposalFilterType.All">{{
					ProposalFilterType[ProposalFilterType.All]
				}}</a-radio>
				<a-radio :value="ProposalFilterType.Active">{{
					ProposalFilterType[ProposalFilterType.Active]
				}}</a-radio>
				<a-radio :value="ProposalFilterType.Future">{{
					ProposalFilterType[ProposalFilterType.Future]
				}}</a-radio>
				<a-radio :value="ProposalFilterType.Past">{{
					ProposalFilterType[ProposalFilterType.Past]
				}}</a-radio>
			</a-radio-group>
		</a-col>
	</a-row>
	<div class="tableContainer">
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
				<template v-if="column.key === 'action'">
					<a-button type="link" @click="() => handleSelectProposal(record)">
						Use
					</a-button>
					<a-button
						type="link"
						danger
						@click="() => handleCloseProposal(record)"
					>
						Delete
					</a-button>
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
import {
	ProposalTableData,
	PaginationCallType,
	ProposalFilterType,
} from "@/types";
import { defineComponent, reactive, ref } from "vue";
import DaoID from "../store/DaoID";
import ProposalTableStore from "../store/ProposalTableStore";
import { secToFormat } from "../utility";
import { decodeProposalParams } from "@/indexer";
import {
	executeReq,
	searchProposalsByAppIdReq,
	getProposalCursorReq,
} from "@/api";
import { MoreOutlined } from "@ant-design/icons-vue";

export default defineComponent({
	name: "ProposalTable",
	components: {
		MoreOutlined,
	},
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
			ProposalFilterType,
		};
	},
	methods: {
		handleFilter() {
			this.handlePagination(PaginationCallType.FIRST_PAGE);
		},
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
			const appId = 483;
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

			if (res && res.sigmaDaosProposalFilter) {
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

				// setting it only at first call since it doesn't change i.e for page 1
				if (currentPage === 1 && res.sigmaDaosProposalFilter.totalCount) {
					this.totalDataRowsCount = res.sigmaDaosProposalFilter.totalCount;
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
			const appId = 483;
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
	},
	mounted() {
		this.handlePagination(PaginationCallType.FIRST_PAGE);
	},
});
</script>
