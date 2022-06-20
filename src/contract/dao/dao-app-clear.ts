import { compileToUnit8Array } from "@/utility";

const daoAppClear = `#pragma version 6
    int 1
    return`;

export const getCompiledDaoClear = async () => {
	return await compileToUnit8Array(daoAppClear);
};
