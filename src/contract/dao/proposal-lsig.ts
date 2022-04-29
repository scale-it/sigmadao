import { compileSignature } from "@/utility";

const proposalLsig = (app_id: number, addr: string) => {
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
    global GroupSize
    int 2
    <=
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
    &&
    gtxn 0 TypeEnum
    int appl
    ==
    &&
    gtxn 0 ApplicationID
    int ${app_id}
    ==
    &&
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
    gtxn 0 TypeEnum
    int pay
    ==
    &&
    gtxn 0 Amount
    int 0
    ==
    &&
    gtxn 0 Sender
    addr ${addr}
    ==
    &&
    gtxn 1 TypeEnum
    int axfer
    ==
    &&
    gtxn 1 AssetAmount
    int 0
    ==
    &&
    ||
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
    &&
    ||
    b main_l5
    main_l4:
    global GroupSize
    int 2
    <=
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
    &&
    gtxn 0 TypeEnum
    int appl
    ==
    &&
    gtxn 0 ApplicationID
    int ${app_id}
    ==
    &&
    txn RekeyTo
    global ZeroAddress
    ==
    txn AssetReceiver
    addr ${addr}
    ==
    txn Receiver
    addr ${addr}
    ==
    ||
    &&
    txn TypeEnum
    int axfer
    ==
    txn TypeEnum
    int pay
    ==
    ||
    &&
    ||
    main_l5:
    return
    `;
};

export const getProposalLsig = async (app_id: number, addr: string) => {
	const proposalSrc = proposalLsig(app_id, addr);
	return await compileSignature(proposalSrc);
};
