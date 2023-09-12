import { web3 } from '@project-serum/anchor';
export declare const web3Consts: {
    systemProgram: web3.PublicKey;
    sysvarInstructions: web3.PublicKey;
    tokenProgram: web3.PublicKey;
    mplProgram: web3.PublicKey;
    associatedTokenProgram: web3.PublicKey;
    addressLookupTableProgram: web3.PublicKey;
    oposToken: web3.PublicKey;
    LAMPORTS_PER_OPOS: number;
    Seeds: {
        mainState: Uint8Array;
        profileState: Uint8Array;
        collectionState: Uint8Array;
        activationTokenState: Uint8Array;
        vault: Uint8Array;
        actMintingCheck: Uint8Array;
    };
};
