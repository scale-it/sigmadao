<template>
	<div class="dao_table_container">
		<a-table
			:dataSource="dataSource"
			:columns="columns"
			bordered
			:pagination="false"
		>
			<template #title>
				<a-col> <h3 style="text-align: center">Sigma DAOs</h3> </a-col>
			</template>
			<template #headerCell="{ column }">
				<template v-if="column.key === 'name'">
					<span class="clickable_text">Name</span>
				</template>
			</template>
			<template
				#customFilterDropdown="{
					setSelectedKeys,
					selectedKeys,
					confirm,
					clearFilters,
					column,
				}"
			>
				<div class="padding_sm">
					<a-input
						ref="searchInput"
						:placeholder="`Search ${column.dataIndex}`"
						:value="selectedKeys[0]"
						class="search_input"
						@change="(e) => handleInputChange(e, setSelectedKeys)"
						@pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
					/>
					<a-button
						type="primary"
						size="small"
						class="search_btn"
						@click="handleSearch(selectedKeys, confirm, column.dataIndex)"
					>
						<template #icon><SearchOutlined /></template>
						Search
					</a-button>
					<a-button
						size="small"
						class="reset_btn"
						@click="handleReset(clearFilters)"
						danger
					>
						Reset
					</a-button>
				</div>
			</template>
			<template #customFilterIcon="{ filtered }">
				<search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
			</template>

			<template #bodyCell="{ text, record, column }">
				<span v-if="searchText && searchedColumn === column.dataIndex">
					<template
						v-for="(fragment, i) in text
							.toString()
							.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
					>
						<mark
							v-if="fragment.toLowerCase() === searchText.toLowerCase()"
							:key="i"
							class="highlight"
						>
							{{ fragment }}
						</mark>
						<template v-else>{{ fragment }}</template>
					</template>
				</span>
				<template v-if="column.key === 'link'">
					<a :href="'//' + record.link" target="_blank">
						{{ record.link }}
					</a>
				</template>
				<template v-if="column.key === 'action'">
					<a-button
						type="link"
						v-if="formState.dao_id !== record.dao_id"
						@click="() => handleSelectDAO(record)"
					>
						Select
					</a-button>
					<a-button
						type="link"
						danger
						v-else
						@click="() => handleDeSelectDao(record)"
					>
						De-Select
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
					@click="handlePaginationCall(PaginationCallType.NAV_PREV)"
					><left-outlined
				/></a>
				<a
					v-else-if="type === 'next'"
					@click="handlePaginationCall(PaginationCallType.NAV_NEXT)"
					><right-outlined
				/></a>
				<component
					@click="
						handlePaginationCall(
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
	daoAppMessage,
	errorMessage,
	GLOBAL_STATE_MAP_KEY,
	loadingMessage,
	openErrorNotificationWithIcon,
	openSuccessNotificationWithIcon,
	ROWS_PER_PAGE,
	SUCCESSFUL,
	successMessage,
	UNSUCCESSFUL,
	VALIDATE_MESSAGES,
} from "@/constants";
import {
	decodeAppParamsState,
	getAssetInformation,
	isApplicationOpted,
	searchApplicationAndAccount,
} from "@/indexer";
import { defineComponent, reactive, ref, toRefs } from "vue";
import DaoStore from "../store/DaoID";
import { executeReq, getAllDaoReq, getCursorReq } from "@/api";
import { DaoTableData, PaginationCallType } from "@/types";
import WalletStore from "@/store/WalletStore";
import {
	SearchOutlined,
	LeftOutlined,
	RightOutlined,
} from "@ant-design/icons-vue";

export default defineComponent({
	name: "AllDao",
	components: {
		SearchOutlined,
		LeftOutlined,
		RightOutlined,
	},
	data() {
		return {
			key: "DaoKey",
			columns: [
				{
					title: "Dao App ID",
					key: "dao_id",
					dataIndex: "dao_id",
				},
				{
					title: "Name",
					key: "name",
					dataIndex: "name",
					customFilterDropdown: true,
					onFilter: (value: string, record: DaoTableData) =>
						this.handleFilterData(value, record),
					onFilterDropdownVisibleChange: (visible: boolean) => {
						if (visible && this.$refs.searchInput) {
							setTimeout(() => {
								(this.$refs.searchInput as any).focus();
							}, 100);
						}
					},
				},
				{
					title: "Token Name",
					key: "token_name",
					dataIndex: "token_name",
				},
				{
					title: "Token ID",
					key: "token_id",
					dataIndex: "token_id",
				},
				{
					title: "Link to DAO",
					key: "link",
					dataIndex: "link",
				},
				{
					title: "Action",
					key: "action",
				},
			],
			walletStore: WalletStore(),
			currentPage: ref(1),
			totalDataRowsCount: ROWS_PER_PAGE,
			ROWS_PER_PAGE,
			dataSource: [] as DaoTableData[],
			currentPageCursor: {
				endCursor: null,
				startCursor: null,
			},
			PaginationCallType,
		};
	},
	methods: {
		handlePaginationCall(type: PaginationCallType, pageNumber?: string) {
			switch (type) {
				case PaginationCallType.NAV_PREV:
					this.fetchDaoData(
						null,
						null,
						ROWS_PER_PAGE,
						this.currentPageCursor.startCursor
					);
					break;
				case PaginationCallType.NAV_NEXT:
					this.fetchDaoData(
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
					this.fetchDaoData(ROWS_PER_PAGE, null, null, null, 1);
					break;
			}
		},
		async handlePageJump(pageNumber: string) {
			if (+pageNumber === 1) {
				this.handlePaginationCall(PaginationCallType.FIRST_PAGE);
			} else {
				await this.getCursorDetails(+pageNumber);
				this.handlePaginationCall(PaginationCallType.NAV_NEXT);
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
						daoAppMessage.SUCCESSFUL(data.dao_id)
					);
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
									daoAppMessage.UNSUCCESFUL,
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
		handleDeSelectDao() {
			this.formState.resetDaoStore();
		},
		handleSearch(
			selectedKeys: string[],
			confirm: (param?: any) => void,
			dataIndex: string
		) {
			confirm();
			this.searchText = selectedKeys[0];
			this.searchedColumn = dataIndex;
		},
		handleReset(clearFilters: (param: any) => void) {
			clearFilters({ confirm: true });
			this.searchText = "";
		},
		handleInputChange(
			e: any,
			setSelectedKeys: (selectedKeys: string[]) => void
		) {
			setSelectedKeys(e.target.value ? [e.target.value] : []);
		},
		handleFilterData(value: string, record: DaoTableData) {
			// TODO: update to use filter from backend (for name)
			return record.name.toString().toLowerCase().includes(value.toLowerCase());
		},
		async getCursorDetails(pageNumber: number) {
			const cursorRes = await executeReq(
				getCursorReq(pageNumber, ROWS_PER_PAGE)
			).catch((error) =>
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message)
			);

			if (
				cursorRes &&
				cursorRes.allSigmaDaos &&
				cursorRes.allSigmaDaos.pageInfo
			) {
				const pageInfo = cursorRes.allSigmaDaos.pageInfo;
				this.currentPageCursor.endCursor = pageInfo.endCursor;
				this.currentPageCursor.startCursor = pageInfo.startCursor;
			}
		},
		async fetchDaoData(
			first: number | null,
			endCursor: string | null,
			last: number | null,
			startCursor: string | null,
			currentPage?: number
		) {
			const res = await executeReq(
				getAllDaoReq(first, endCursor, last, startCursor)
			).catch((error) =>
				openErrorNotificationWithIcon(UNSUCCESSFUL, error.message)
			);
			if (res && res.allSigmaDaos) {
				if (res.allSigmaDaos.nodes.length) {
					// clean existing data in temp array with change of page
					if (this.dataSource.length) {
						this.dataSource = [];
					}
					res.allSigmaDaos.nodes.map(async (item: any, index: number) => {
						if (item.appParams) {
							item.appParams = JSON.parse(item.appParams);
						}
						const globalState = decodeAppParamsState(item.appParams.dt.gd);
						const tokenData = await getAssetInformation(item.assetId);
						let data = {
							key: index,
							dao_id: +item.appId,
							token_id: +item.assetId,
							token_name: tokenData.name as string,
							name: globalState.get(GLOBAL_STATE_MAP_KEY.DaoName) as string,
							link: globalState.get(GLOBAL_STATE_MAP_KEY.Url) as string,
						};
						this.dataSource.push(data);

						// pushing data to store only if it doesn't exists
						let isCached = false;
						isCached = this.formState.psqlData.has(+item.appId);
						if (!isCached) {
							this.formState.psqlData.set(+item.appId, data);
						}
					});
				}

				if (res.allSigmaDaos.pageInfo) {
					const pageInfo = res.allSigmaDaos.pageInfo;
					this.currentPageCursor.startCursor = pageInfo.startCursor;
					this.currentPageCursor.endCursor = pageInfo.endCursor;
				}

				// setting it only at first call since it doesn't change i.e for page 1
				if (currentPage === 1 && res.allSigmaDaos.totalCount) {
					this.totalDataRowsCount = res.allSigmaDaos.totalCount;
				}
			}
		},
	},
	setup() {
		const formState = reactive(DaoStore());
		const state = reactive({
			searchText: "",
			searchedColumn: "",
		});
		const searchInput = ref();

		return {
			formState,
			validateMessages: VALIDATE_MESSAGES,
			searchInput,
			...toRefs(state),
		};
	},
	mounted() {
		this.handlePaginationCall(PaginationCallType.FIRST_PAGE);
	},
});
</script>
