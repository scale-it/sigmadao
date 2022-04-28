import { compileSignature } from "@/utility";

const daoFundLsig = (app_id: number) => {
	return `#pragma version 4
    global GroupSize
    int 1
    ==
    bnz main_l4
    global GroupSize
    int 2
    ==
    bnz main_l3
    err
    main_l3:
    gtxn 0 RekeyTo
    global ZeroAddress
    ==
    gtxn 0 CloseRemainderTo
    global ZeroAddress
    ==
    &&
    gtxn 0 AssetCloseTo
    global ZeroAddress
    ==
    &&
    gtxn 0 TypeEnum
    int appl
    ==
    &&
    gtxn 0 ApplicationID
    int ${app_id}
    ==
    &&
    gtxna 0 ApplicationArgs 0
    byte "execute"
    ==
    &&
    gtxn 1 RekeyTo
    global ZeroAddress
    ==
    gtxn 1 CloseRemainderTo
    global ZeroAddress
    ==
    &&
    gtxn 1 AssetCloseTo
    global ZeroAddress
    ==
    &&
    &&
    gtxn 1 TypeEnum
    int axfer
    ==
    gtxn 1 TypeEnum
    int pay
    ==
    ||
    &&
    b main_l5
    main_l4:
    txn RekeyTo
    global ZeroAddress
    ==
    txn CloseRemainderTo
    global ZeroAddress
    ==
    &&
    txn AssetCloseTo
    global ZeroAddress
    ==
    &&
    txn TypeEnum
    int axfer
    ==
    &&
    txn AssetAmount
    int 0
    ==
    &&
    main_l5:
    return
    `;
};

export const getDaoFundLSig = async (app_id: number) => {
	const proposalSrc = daoFundLsig(app_id);
	return await compileSignature(proposalSrc);
};
