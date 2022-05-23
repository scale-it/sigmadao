import { queryRoot } from "./handler";
const { GraphQLSchema } = require("graphql");

export const schema = new GraphQLSchema({ query: queryRoot });

module.exports = {
	schema,
};
