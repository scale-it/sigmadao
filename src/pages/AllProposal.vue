<template>
	<div class="padding_inline_med margin_bottom_sm">
		<h3 style="text-align: center">Proposals</h3>
		<div class="flexbox_justify_space">
			<a-radio-group
				v-model:value="this.proposalDataStore.filterType"
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
			<a-button
				type="primary"
				:disabled="!daoStore.isDaoSelected || !walletStore.address"
				@click="handleCreateProposal"
			>
				Add Proposal
				<template #icon><PlusOutlined /></template>
			</a-button>
		</div>
	</div>
	<a-row class="dao-table" type="flex" justify="center">
		<div v-if="dataSource.length > 0" class="padding_inline_med">
			<a-list
				:grid="{ gutter: 25, xs: 1, sm: 2, column: 3, size: 'middle' }"
				:data-source="dataSource"
			>
				<template #renderItem="{ item }">
					<a-list-item class="margin_top_sm">
						<a-card
							:class="isCurrentProposalSelected(item) && 'selected_dao_card'"
							hoverable
						>
							<template #title>
								<a :href="'//' + item.url" target="_blank">
									{{ item.name }}
								</a>
							</template>
							<template #extra>
								<div
									v-if="isCurrentProposalSelected(item)"
									style="color: #1890ff"
								>
									Selected
								</div></template
							>
							<template #actions>
								<a-button type="link" @click="() => handleSelectProposal(item)">
									Use
								</a-button>
								<a-button
									type="link"
									danger
									@click="() => handleCloseProposal(item)"
								>
									Close
								</a-button></template
							>
							<a-descriptions :column="1">
								<a-descriptions-item label="Type">{{
									ProposalType[item.type]
								}}</a-descriptions-item>
								<a-descriptions-item label="Voting Start">{{
									secToFormat(
										item.voting_start,
										DateTimeFormat.DAY_TIME_WITH_DAY
									)
								}}</a-descriptions-item>
								<a-descriptions-item label="Voting End">{{
									secToFormat(
										item.voting_start,
										DateTimeFormat.DAY_TIME_WITH_DAY
									)
								}}</a-descriptions-item>
							</a-descriptions>
						</a-card>
					</a-list-item>
				</template>
			</a-list>
		</div>
		<div v-else-if="dataLoading" class="spinner_container">
			<a-spin size="large" />
			<h4 class="margin_left_sm">Fetching Data</h4>
		</div>
		<div v-else>
			<div v-if="!daoStore.dao_id">
				<a-alert
					message="Please select a DAO to get its proposals."
					type="info"
					show-icon
				/>
			</div>
			<div v-else>
				<a-empty description="No Proposals Exists" />
			</div>
		</div>
	</a-row>
	<div class="flex_end">
		<TablePagination
			v-bind:totalDataRowsCount="totalDataRowsCount"
			:paginationHandler="handlePagination"
		/>
	</div>
</template>

<script lang="ts">
import {
	VALIDATE_MESSAGES,
	openErrorNotificationWithIcon,
	UNSUCCESSFUL,
	ROWS_PER_PAGE,
	ProposalType,
	PROPOSAL_LOCAL_STATE_MAP_KEY,
	SUCCESSFUL,
	openSuccessNotificationWithIcon,
	daoAppMessage,
} from "@/constants";
import {
	ProposalTableData,
	PaginationCallType,
	ProposalFilterType,
	DateTimeFormat,
	EndPoint,
} from "@/types";
import { defineComponent, reactive } from "vue";
import DaoID from "../store/DaoID";
import ProposalTableStore from "../store/ProposalTableStore";
import ProposalStore from "../store/ProposalStore";
import { secToFormat, convertHexToAlgorandAddr, redirectTo } from "../utility";
import { decodeProposalParams } from "@/indexer";
import TablePagination from "../UIKit/TablePagination.vue";
import {
	executeReq,
	searchProposalsByAppIdReq,
	getProposalCursorReq,
} from "@/api";
import WalletStore from "@/store/WalletStore";

export default defineComponent({
	name: "AllProposals",
	components: {
		TablePagination,
	},
	data() {
		return {
			key: "AllProposalKey",
			dataLoading: false,
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
		const proposalDataStore = reactive(ProposalTableStore());
		const daoStore = reactive(DaoID());
		const proposalStore = reactive(ProposalStore());
		const walletStore = reactive(WalletStore());

		return {
			proposalDataStore,
			daoStore,
			validateMessages: VALIDATE_MESSAGES,
			ProposalFilterType,
			proposalStore,
			walletStore,
		};
	},
	methods: {
		isCurrentProposalSelected(item: ProposalTableData) {
			return this.proposalStore.selected_address === item.proposal_addr;
		},
		handleCreateProposal() {
			redirectTo(this.$router, EndPoint.ADD_PROPOSAL);
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
					this.fetchProposalData(ROWS_PER_PAGE, null, null, null);
					break;
			}
		},
		async fetchProposalData(
			first: number | null,
			endCursor: string | null,
			last: number | null,
			startCursor: string | null
		) {
			this.dataLoading = true;
			const appId = this.daoStore.dao_id as number;
			const res = await executeReq(
				searchProposalsByAppIdReq(
					appId,
					this.proposalDataStore.filterType,
					first,
					endCursor,
					last,
					startCursor
				)
			).catch((error) => {
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
				this.dataLoading = false;
			});

			if (res?.sigmaDaosProposalFilter) {
				if (res.sigmaDaosProposalFilter.nodes.length) {
					// clean existing data in temp array with change of page
					if (this.dataSource.length) {
						this.dataSource = [];
					}
					res.sigmaDaosProposalFilter.nodes.map(
						async (item: any, index: number) => {
							const proposal_addr = convertHexToAlgorandAddr(item.addr);
							let parsedData = await decodeProposalParams(item.localstate);
							parsedData["key"] = index; // for antd table
							parsedData["proposal_addr"] = proposal_addr;
							this.dataSource.push(parsedData);
							// pushing data to store only if it doesn't exists
							let isCached = false;
							isCached = this.proposalDataStore.psqlData.has(+item.appId);
							if (!isCached) {
								this.proposalDataStore.psqlData.set(+item.appId, parsedData);
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
			this.dataLoading = false;
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
			this.dataLoading = true;
			const appId = this.daoStore.dao_id as number;
			const cursorRes = await executeReq(
				getProposalCursorReq(
					appId,
					this.proposalDataStore.filterType,
					pageNumber,
					ROWS_PER_PAGE
				)
			).catch((error) => {
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
				this.dataLoading = false;
			});

			if (cursorRes.sigmaDaosProposalFilter.pageInfo ?? false) {
				const pageInfo = cursorRes.sigmaDaosProposalFilter.pageInfo;
				this.currentPageCursor.endCursor = pageInfo.endCursor;
				this.currentPageCursor.startCursor = pageInfo.startCursor;
			}
			this.dataLoading = false;
		},
		async handleSelectProposal(record: ProposalTableData) {
			if (record.proposal_addr) {
				this.proposalStore.selected_address = record.proposal_addr;
				openSuccessNotificationWithIcon(
					SUCCESSFUL,
					daoAppMessage.PROPOSAL_SUCCESSFUL(record.name)
				);
			} else {
				openErrorNotificationWithIcon(
					UNSUCCESSFUL,
					daoAppMessage.PROPOSAL_UNSUCCESSFUL
				);
			}
		},
		async handleCloseProposal(record: ProposalTableData) {
			console.log("closed", record);
		},
		async loadTable() {
			this.handlePagination(PaginationCallType.FIRST_PAGE);
		},
	},
	mounted() {
		this.proposalDataStore.loadTable = this.loadTable;
		this.loadTable();
	},
});
</script>
