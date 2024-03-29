<template>
	<div class="margin_bottom_sm">
		<h3 class="text_center">Sigma DAOs</h3>
		<div class="flexbox_justify_space">
			<a-input-search
				style="width: 40%; margin: auto"
				enter-button
				placeholder="Search DAO by Name"
				v-model:value="searchText"
				@search="handleFilterData()"
			/>
			<a-button
				type="primary"
				:disabled="!walletStore.address"
				@click="handleCreateDAO"
			>
				Create a DAO
				<template #icon><PlusOutlined /></template>
			</a-button>
		</div>
	</div>
	<a-row class="dao-table" type="flex" justify="center">
		<div v-if="dataSource.length > 0">
			<a-list
				:grid="{ gutter: 25, xs: 1, sm: 2, column: 3, size: 'middle' }"
				:data-source="dataSource"
			>
				<template #renderItem="{ item }">
					<a-list-item class="margin_top_sm">
						<a-card
							:class="isDaoSelected(item) && 'selected_dao_card'"
							hoverable
							:title="item.name"
							@click="handleSelectDAO(item)"
						>
							<template #extra>
								<div v-if="isDaoSelected(item)" style="color: #1890ff">
									Selected
								</div></template
							>
							<a-descriptions :column="1">
								<a-descriptions-item label="App ID">{{
									item.dao_id
								}}</a-descriptions-item>
								<a-descriptions-item label="Token Name">{{
									item.token_name
								}}</a-descriptions-item>
								<a-descriptions-item label="Gov Token ID">{{
									item.token_id
								}}</a-descriptions-item>
								<a-descriptions-item label="Link">
									<a :href="'//' + item.link" target="_blank">
										{{ item.link }}
									</a>
								</a-descriptions-item>
								<a-descriptions-item label="Proposals">
									{{ item.proposal_count }}
								</a-descriptions-item>
								<a-descriptions-item label="DAO Address">
									<address-copyable :walletAddress="item.dao_address" />
								</a-descriptions-item>
								<a-descriptions-item label="Algo Balance">
									{{ item.lsig_fund_algo }}
								</a-descriptions-item>
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
			<a-empty :description="EmptyDataDescription.DAO" />
		</div>
	</a-row>
	<div class="flex_end">
		<TablePagination
			v-bind:totalDataRowsCount="totalDataRowsCount"
			:paginationHandler="handlePaginationCall"
		/>
	</div>
</template>

<script lang="ts">
import {
	daoAppMessage,
	errorMessage,
	loadingMessage,
	openErrorNotificationWithIcon,
	openSuccessNotificationWithIcon,
	ROWS_PER_PAGE,
	SUCCESSFUL,
	successMessage,
	UNSUCCESSFUL,
	VALIDATE_MESSAGES,
	EmptyDataDescription,
} from "@/constants";
import {
	decodeDaoAppParams,
	handleDaoSearch,
	isApplicationOpted,
	searchApplicationAndAccount,
} from "@/indexer";
import { defineComponent, reactive } from "vue";
import DaoStore from "../store/DaoID";
import {
	executeReq,
	getAllDaoReq,
	getCursorReq,
	getDaoInfoByAppNameCursorReq,
	searchProposalsByAppIdReq,
} from "@/api";
import {
	DaoTableData,
	PaginationCallType,
	EndPoint,
	SearchDaoType,
	ProposalFilterType,
} from "@/types";
import WalletStore from "@/store/WalletStore";
import TablePagination from "../UIKit/TablePagination.vue";
import { redirectTo, getTruncatedAddress } from "@/utility";
import { PlusOutlined } from "@ant-design/icons-vue";
import AddressCopyable from "@/UIKit/Address.vue";
import { storeToRefs } from "pinia";

export default defineComponent({
	name: "AllDao",
	components: {
		TablePagination,
		PlusOutlined,
		AddressCopyable,
	},
	data() {
		return {
			key: "DaoKey",
			dataLoading: false,
			searchText: "",
			walletStore: WalletStore(),
			totalDataRowsCount: ROWS_PER_PAGE,
			ROWS_PER_PAGE,
			dataSource: [] as DaoTableData[],
			currentPageCursor: {
				endCursor: null,
				startCursor: null,
			},
			PaginationCallType,
			EndPoint,
			isFilterActive: false,
			EmptyDataDescription,
			getTruncatedAddress,
		};
	},
	methods: {
		isDaoSelected(item: DaoTableData) {
			return this.formState.dao_id === item.dao_id;
		},
		handlePaginationCall(type: PaginationCallType, pageNumber?: string) {
			// calls handleDaoNameSearch if user is using filter else fetchDaoData
			const dynamicCallback =
				this.isFilterActive && this.searchText
					? this.handleDaoNameSearch
					: this.fetchDaoData;
			switch (type) {
				case PaginationCallType.NAV_PREV:
					dynamicCallback(
						null,
						null,
						ROWS_PER_PAGE,
						this.currentPageCursor.startCursor
					);
					break;
				case PaginationCallType.NAV_NEXT:
					dynamicCallback(
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
					dynamicCallback(ROWS_PER_PAGE, null, null, null);
					break;
			}
		},
		async handlePageJump(pageNumber: string) {
			if (+pageNumber === 1) {
				this.handlePaginationCall(PaginationCallType.FIRST_PAGE);
			} else {
				if (this.isFilterActive && this.searchText) {
					await this.getDaoNameCursorDetails(+pageNumber);
				} else {
					await this.getCursorDetails(+pageNumber);
				}
				this.handlePaginationCall(PaginationCallType.NAV_NEXT);
			}
		},
		async getDaoNameCursorDetails(pageNumber: number) {
			const cursorRes = await executeReq(
				getDaoInfoByAppNameCursorReq(this.searchText, pageNumber, ROWS_PER_PAGE)
			).catch((error) =>
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message)
			);
			if (cursorRes?.searchSigmaDaos?.pageInfo) {
				const pageInfo = cursorRes.searchSigmaDaos.pageInfo;
				this.currentPageCursor.endCursor = pageInfo.endCursor;
				this.currentPageCursor.startCursor = pageInfo.startCursor;
			}
		},
		handleSelectDAO(data: DaoTableData) {
			this.formState.govt_id = data.token_id;
			this.formState.dao_id = data.dao_id;
			loadingMessage(this.key);
			searchApplicationAndAccount()
				.then(() => {
					successMessage(this.key);
					openSuccessNotificationWithIcon(
						SUCCESSFUL,
						daoAppMessage.DAO_SUCCESSFUL(data.dao_id)
					);
					redirectTo(this.$router, EndPoint.DAO_INFO);
					DaoStore().searchDaoId = data.dao_id;
					if (this.walletStore.address) {
						isApplicationOpted(this.walletStore.address, data.dao_id)
							.then((appIsOptedIn: boolean) => {
								this.formState.show_opt_in = !appIsOptedIn;
								if (appIsOptedIn) {
									openSuccessNotificationWithIcon(daoAppMessage.ALREADY_OPT_IN);
								}
							})
							.catch((error) =>
								openErrorNotificationWithIcon(
									daoAppMessage.DAO_UNSUCCESFUL,
									error.message
								)
							);
					}
				})
				.catch((error) => {
					errorMessage(this.key);
					openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
				});
		},
		handleCreateDAO() {
			redirectTo(this.$router, EndPoint.CREATE_DAO);
		},
		handleDeSelectDao() {
			this.formState.resetDaoStore();
		},
		handleFilterData() {
			this.isFilterActive = true;
			this.dataSource = [];
			this.handlePaginationCall(PaginationCallType.FIRST_PAGE);
		},
		async getCursorDetails(pageNumber: number) {
			const cursorRes = await executeReq(
				getCursorReq(pageNumber, ROWS_PER_PAGE)
			).catch((error) =>
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message)
			);

			if (cursorRes?.allApps?.pageInfo) {
				const pageInfo = cursorRes.allApps.pageInfo;
				this.currentPageCursor.endCursor = pageInfo.endCursor;
				this.currentPageCursor.startCursor = pageInfo.startCursor;
			}
		},
		async getProposalCount(parsedData: DaoTableData) {
			const proposalRes = await executeReq(
				searchProposalsByAppIdReq(
					parsedData.dao_id,
					ProposalFilterType.All,
					null,
					null,
					null,
					null
				)
			).catch((error) =>
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message)
			);
			if (proposalRes?.sigmaDaosProposalFilter) {
				parsedData.proposal_count =
					proposalRes.sigmaDaosProposalFilter?.nodes?.length ?? 0;
			}
		},
		async fetchDaoData(
			first: number | null,
			endCursor: string | null,
			last: number | null,
			startCursor: string | null
		) {
			this.dataLoading = true;
			const res = await executeReq(
				getAllDaoReq(first, endCursor, last, startCursor)
			).catch((error) => {
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
				this.dataLoading = false;
			});
			if (res && res.allApps) {
				if (res.allApps.nodes.length) {
					// clean existing data in temp array with change of page
					if (this.dataSource.length) {
						this.dataSource = [];
					}
					res.allApps.nodes.map(async (item: any, index: number) => {
						let parsedData = await decodeDaoAppParams(item);
						await this.getProposalCount(parsedData);
						parsedData["key"] = index; // for antd table
						this.dataSource.push(parsedData);

						// pushing data to store only if it doesn't exists
						let isCached = false;
						isCached = this.formState.psqlData.has(+item.index);
						if (!isCached) {
							this.formState.psqlData.set(+item.index, parsedData);
						}
					});
				}

				if (res.allApps.pageInfo) {
					const pageInfo = res.allApps.pageInfo;
					this.currentPageCursor.startCursor = pageInfo.startCursor;
					this.currentPageCursor.endCursor = pageInfo.endCursor;
				}
				this.totalDataRowsCount = res.allApps.totalCount;
			}
			this.dataLoading = false;
		},
		async handleDaoNameSearch(
			first: number | null,
			endCursor: string | null,
			last: number | null,
			startCursor: string | null
		) {
			this.dataLoading = true;
			const response = await handleDaoSearch(
				SearchDaoType.SEARCH_BY_DAO_NAME,
				this.searchText,
				first,
				endCursor,
				last,
				startCursor
			).catch((error) => {
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message);
				this.dataLoading = false;
			});
			if (response) {
				for (const item of response.dataSource) {
					await this.getProposalCount(item);
				}
				if (response.pageInfo) {
					const pageInfo = response.pageInfo;
					this.currentPageCursor.startCursor = pageInfo.startCursor;
					this.currentPageCursor.endCursor = pageInfo.endCursor;
				}
				this.dataSource = response.dataSource;

				if (response.totalCount) {
					this.totalDataRowsCount = response.totalCount;
				}
			}
			this.dataLoading = false;
		},
	},
	setup() {
		const formState = reactive(DaoStore());
		const { network } = storeToRefs(WalletStore());
		return {
			formState,
			validateMessages: VALIDATE_MESSAGES,
			network,
		};
	},
	mounted() {
		if (this.walletStore.network) {
			this.handlePaginationCall(PaginationCallType.FIRST_PAGE);
		}
	},
	watch: {
		network() {
			if (this.walletStore.network) {
				// no DAOs are fetch
				if (!this.dataSource.length) {
					this.handlePaginationCall(PaginationCallType.FIRST_PAGE);
				}
			}
		},
	},
});
</script>
