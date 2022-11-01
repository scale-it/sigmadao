const { types } = require("@algo-builder/web");

async function tryExecuteTx(deployer, txnParams) {
	try {
		const txnParameters = Array.isArray(txnParams) ? txnParams : [txnParams];
		return await deployer.executeTx(txnParameters);
	} catch (e) {
		console.error("Transaction Failed", e.response ? e.response.body : e);
	}
}

/**
 * Fund accounts from master with 20 Algos
 * @param {*} deployer algobDeployer
 * @param {*} accounts account or list of accounts to fund
 */
async function fundAccount(deployer, accounts) {
	const master = deployer.accountsByName.get("master-account");
	const params = [];
	if (!(accounts instanceof Array)) {
		accounts = [accounts];
	}
	for (const a of accounts) {
		console.log(`* Funding Account: ${a.name} *`);
		params.push({
			type: types.TransactionType.TransferAlgo,
			sign: types.SignType.SecretKey,
			fromAccount: master,
			toAccountAddr: a.addr,
			amountMicroAlgos: 30e6,
			payFlags: { totalFee: 1000, note: "funding account" },
		});
	}

	try {
		await deployer.executeTx(params);
	} catch (e) {
		console.error("Transaction Failed", e.response ? e.response.error.text : e);
	}
}

module.exports = {
	fundAccount,
	tryExecuteTx,
};
