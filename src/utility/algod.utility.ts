import { types, tx as webTx, mkTxParams, WebMode } from "@algo-builder/web";
import algodClient from "@/config/algob.config";
import type { LogicSigAccount } from "algosdk";
import algosdk from "algosdk";

export const fundAmount = async (
	from: string,
	to: string,
	amount: number,
	webMode: WebMode
) => {
	const txParamss: types.ExecParams[] = [
		{
			type: types.TransactionType.TransferAlgo,
			sign: types.SignType.SecretKey,
			fromAccount: {
				addr: from,
				sk: new Uint8Array(0),
			},
			toAccountAddr: to,
			amountMicroAlgos: amount,
			payFlags: { totalFee: 1000 },
		},
	];
	const response = await webMode.executeTx(txParamss);
	console.log("Funded: ", response);
};

export const optInToApp = async (
	lsig: LogicSigAccount,
	execParam: types.ExecParams,
	webMode: WebMode
) => {
	try {
		const params = await mkTxParams(algodClient, {});
		const optInLsigToAppTx = await webTx.mkTransaction(execParam, params);
		const rawLsigSignedTx = algosdk.signLogicSigTransactionObject(
			optInLsigToAppTx,
			lsig
		).blob;
		const txInfo = await algodClient.sendRawTransaction(rawLsigSignedTx).do();
		const optInResponse = await webMode.waitForConfirmation(txInfo.txId);
		console.log("optInResponse: ", optInResponse);
	} catch (error) {
		console.error(error);
	}
};
