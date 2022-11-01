import { BACKEND_PORT } from "./config";
import { dbUrl } from "./psql";
const { MutationPlugin } = require("graphile-build");
const { postgraphile } = require("postgraphile");
const express = require("express");
const app = express();

app.use(
	postgraphile(dbUrl, "public", {
		ignoreRBAC: true,
		extendedErrors: ["errcode", "detail", "hint"],
		graphiql: true,
		enhanceGraphiql: true,
		graphqlRoute: "/api",
		graphiqlRoute: "/graphiql",
		disableDefaultMutations: true, // disables the default mutation only
		enableCors: true,
		skipPlugins: [
			MutationPlugin, // disables the mutation permanently
		],
	})
);

app.listen(BACKEND_PORT, () => {
	console.log("postgraphile API running on port:", BACKEND_PORT);
});
