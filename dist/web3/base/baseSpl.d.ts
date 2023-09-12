import { web3 } from "@project-serum/anchor";
export type createTokenOptions = {
    mintAuthority: web3.PublicKey;
    /** default (`mintAuthority`) */
    payer?: web3.PublicKey;
    /** default (`mintAuthority`) */
    freezAuthority?: web3.PublicKey;
    /** default (`0`) */
    decimal?: number;
    /** default (`Keypair.genrate()`) */
    mintKeypair?: web3.Keypair;
    mintingInfo?: {
        tokenReceiver?: web3.PublicKey;
        /** default (`1`) */
        tokenAmount?: number;
        /** default (`false`) */
        allowOffCurveOwner?: boolean;
    };
};
export type getOrCreateTokenAccountOptons = {
    mint: web3.PublicKey;
    owner: web3.PublicKey;
    /** default (`owner`) */
    payer?: web3.PublicKey;
    /** default (`false`) */
    allowOffCurveOwner?: boolean;
    checkCache?: boolean;
};
export declare class BaseSpl {
    __connection: web3.Connection;
    __splIxs: web3.TransactionInstruction[];
    __cacheAta: Set<String>;
    constructor(connection: web3.Connection);
    __reinit(): void;
    __getCreateTokenInstructions(opts: createTokenOptions): Promise<{
        mintKp: web3.Keypair;
        ixs: web3.TransactionInstruction[];
    }>;
    __getCreateTokenAccountInstruction(mint: web3.PublicKey, owner: web3.PublicKey, allowOffCurveOwner?: boolean, payer?: web3.PublicKey): {
        ata: web3.PublicKey;
        ix: web3.TransactionInstruction;
    };
    __getOrCreateTokenAccountInstruction(input: getOrCreateTokenAccountOptons, ixCallBack?: (ixs?: web3.TransactionInstruction[]) => void): Promise<{
        ata: web3.PublicKey;
        ix: web3.TransactionInstruction | null;
    }>;
}
