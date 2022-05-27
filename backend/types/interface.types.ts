export interface DaoItemType {
	app_id?: number;
	app_params?: string;
	asset_id?: number;
}

export interface Page {
	pageNumber: number;
	pageSize: number;
}

interface PageInfo {
	hasPrev: boolean;
	hasNext: boolean;
	totalDaos: number;
}

export interface DaosAndPageResType {
	daos: [DaoItemType];
	PageInfo: PageInfo;
}
