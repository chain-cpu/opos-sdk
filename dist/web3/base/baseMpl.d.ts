import { web3 } from "@project-serum/anchor";
import { Wallet as AWallet } from '@project-serum/anchor/dist/browser/src/provider';
import { Metaplex } from "@metaplex-foundation/js";
export declare class BaseMpl {
    connection: web3.Connection;
    mplIxs: web3.TransactionInstruction[];
    mplSigns: web3.Keypair[];
    metaplex: Metaplex;
    constructor(wallet: AWallet, web3Config: {
        endpoint: string;
    });
    setUpCallBack: (ixs: web3.TransactionInstruction[], signs: web3.Keypair[]) => void;
    reinit(): void;
    static getEditionAccount(tokenId: web3.PublicKey): web3.PublicKey;
    static getMetadataAccount(tokenId: web3.PublicKey): web3.PublicKey;
    static getCollectionAuthorityRecordAccount(collection: web3.PublicKey, authority: web3.PublicKey): web3.PublicKey;
}
