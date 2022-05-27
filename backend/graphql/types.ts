const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLBoolean,
	GraphQLList,
} = require("graphql");
import { DaoAndPageResType } from "../types";

const DaoType = new GraphQLObjectType({
	name: "Dao",
	description: "Dao Single Record",
	fields: () => ({
		app_id: { type: GraphQLInt, description: "app id" },
		app_params: {
			type: GraphQLString,
			description: "app params like global state etc.",
		},
		asset_id: { type: GraphQLInt, description: "asset id" },
	}),
});

const PageInfoType = new GraphQLObjectType({
	name: "Page",
	description: "Page Info",
	fields: () => ({
		hasPrev: { type: GraphQLBoolean, description: "Prev page exists or not" },
		hasNext: { type: GraphQLBoolean, description: "Next page exists or not" },
		totalDaos: { type: GraphQLInt, description: "Total number of daos" },
	}),
});

export const DaosAndPageInfoType = new GraphQLObjectType({
	name: "DaoAndPage",
	description: "Dao and Page Info",
	fields: () => ({
		Daos: {
			type: new GraphQLList(DaoType),
			description: "All Daos",
			resolve: (parent: DaoAndPageResType) => parent.daos || [],
		},
		pageInfo: {
			type: PageInfoType,
			description: "Page Info",
			resolve: (parent: DaoAndPageResType) => parent.pageInfo,
		},
	}),
});
