const unusedVarsCfg = [
	"warn",
	{
		vars: "all",
		args: "none",
		ignoreRestSiblings: false,
		varsIgnorePattern: "_",
	},
];

module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		"plugin:vue/vue3-essential",
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier",
	],
	parserOptions: {
		ecmaVersion: 2020,
	},
	rules: {
		"no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
		"no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
		"no-unused-vars": unusedVarsCfg,
		"@typescript-eslint/no-unused-vars": unusedVarsCfg,
		"import/no-named-as-default-member": "off",
		"simple-import-sort/imports": "off",
		"sort-imports": "off",
		"@typescript-eslint/no-var-requires": "off",
	},
	overrides: [
		{
			files: ["**/*.js, **/*.ts"],
			rules: {
				"@typescript-eslint/no-var-requires": "off",
			},
		},
	],
	ignorePatterns: ["**/*.json"],
};
