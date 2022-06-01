import { BACKEND_PORT } from "./config";
import { dbUrl } from "./psql";
const { postgraphile } = require("postgraphile");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.use(
	postgraphile(dbUrl, "public", {
		ignoreRBAC: true,
		extendedErrors: ["errcode", "detail", "hint"],
		graphiql: true,
		enhanceGraphiql: true,
		graphqlRoute: "/api",
		graphiqlRoute: "/graphiql",
	})
);

app.listen(BACKEND_PORT, () => {
	console.log("postgraphile API running on port:", BACKEND_PORT);
});
