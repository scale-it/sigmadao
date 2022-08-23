import { isAssetOpted } from "@/indexer";
import { DAOActions } from "@/types";
import { types } from "@algo-builder/web";
import { ExecParams } from "@algo-builder/web/build/types";
import { LogicSigAccount } from "algosdk";

/**
 * closes proposal by creator
 * @param proposerAddr : account addr of the proposer
 * @param proposalLsig : LsigAccount of the proposal
 * @param tokenID : Gov Token ID/index
 * @param daoAppID : DAO app ID
 * @param webMode : webmode to execute transaction
 */
export const closeProposal = async (
	proposerAddr: string,
	proposalLsig: LogicSigAccount,
	tokenID: number,
	daoAppID: number,
	webMode: any // eslint-disable-line
) => {
	// optIn to ASA(GOV_TOKEN) by proposalLsig
	// we will receive the deposit back into proposalLsig
	const optInTx: ExecParams[] = [
		{
			type: types.TransactionType.TransferAlgo,
			sign: types.SignType.SecretKey,
			fromAccount: {
				addr: proposerAddr,
				sk: new Uint8Array(0),
			},
			toAccountAddr: proposalLsig.address(),
			amountMicroAlgos: 0,
			payFlags: {},
		},
		{
			type: types.TransactionType.OptInASA,
			sign: types.SignType.LogicSignature,
			fromAccountAddr: proposalLsig.address(),
			lsig: proposalLsig,
			assetID: tokenID,
			payFlags: {},
		},
	];
	const closeProposalTx: ExecParams[] = [
		{
			type: types.TransactionType.CallApp,
			sign: types.SignType.LogicSignature,
			fromAccountAddr: proposalLsig.address(),
			appID: daoAppID,
			lsig: proposalLsig,
			payFlags: { totalFee: 2000 },
			appArgs: [DAOActions.CLOSE_PROPOSAL],
			foreignAssets: [tokenID],
		},
	];
	try {
		const isGovTokenOpted = await isAssetOpted(proposalLsig.address(), tokenID);
		if (!isGovTokenOpted) {
			const optInResponse = await webMode.executeTx(optInTx);
			console.log(optInResponse);
		}
		const closeProposalResponse = await webMode.executeTx(closeProposalTx);
		console.log(closeProposalResponse);
	} catch (error) {
		console.error("Close Proposal transaction failed", error);
		throw error;
	}
};
