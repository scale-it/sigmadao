export interface DaoItemType {
	app_id?: number;
	app_params?: string;
	asset_id?: number;
}

export interface DaoArgType {
	pageNumber: number;
	pageSize: number;
}

export interface DaoAndPageResType {
	Daos: object;
	pageInfo: object;
}
