import { AnchorProvider, Program, web3 } from "@project-serum/anchor";
import { Wallet as AWallet } from '@project-serum/anchor/dist/browser/src/provider';
import { Sop } from "./sop";
import { CommonInfo, LineageInfo, ParsedLineageInfo, Result, TxPassType, UserInfo, _MintProfileByAtInput, _MintSubscriptionToken } from "./web3Types";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { Metaplex } from '@metaplex-foundation/js';
import { BaseSpl } from "./base/baseSpl";
export declare class Connectivity {
    programId: web3.PublicKey;
    provider: AnchorProvider;
    txis: web3.TransactionInstruction[];
    extraSigns: web3.Keypair[];
    multiSignInfo: any[];
    program: Program<Sop>;
    mainState: web3.PublicKey;
    connection: web3.Connection;
    metaplex: Metaplex;
    baseSpl: BaseSpl;
    cacheMeta: Map<String, Metadata>;
    constructor(wallet: AWallet, web3Config: {
        endpoint: string;
        programId: string;
    });
    reinit(): void;
    ixCallBack: (ixs?: web3.TransactionInstruction[]) => void;
    __getProfileStateAccount(mint: web3.PublicKey | string): web3.PublicKey;
    __getCollectionStateAccount(mint: web3.PublicKey): web3.PublicKey;
    __getActivationTokenStateAccount(mint: web3.PublicKey): web3.PublicKey;
    __getValutAccount(profile: web3.PublicKey): web3.PublicKey;
    __getActMintingCheckAccount(token: web3.PublicKey): web3.PublicKey;
    airdropTokens(commonInfo: CommonInfo): Promise<Result<TxPassType<{
        activationToken: string;
    }>, any>>;
    mintProfileByActivationToken(input: _MintProfileByAtInput, commonInfo: CommonInfo): Promise<Result<TxPassType<{
        profile: string;
    }>, any>>;
    _initSubscriptionBadge(input: {
        profile: web3.PublicKey | string;
        name: string;
        symbol?: string;
        uri?: string;
        amount?: number;
    }): Promise<Result<TxPassType<{
        subscriptionToken: string;
    }>, any>>;
    _mintSubscriptionToken(input: _MintSubscriptionToken): Promise<Result<TxPassType<{
        subscriptionToken: string;
    }>, any>>;
    mintSubscriptionBadge(input: _MintSubscriptionToken, metadata?: {
        image?: string;
    }): Promise<Result<TxPassType<{
        subscriptionToken: string;
    }>, any>>;
    mintOffer(input: {
        profile: web3.PublicKey | string;
        name: string;
        symbol?: string;
        image?: string;
        description?: string;
    }): Promise<Result<TxPassType<{
        offer: string;
    }>, any>>;
    __getProfileHoldersInfo(input: LineageInfo, parentProfile: web3.PublicKey, genesisProfile: web3.PublicKey): Promise<{
        parentProfile: web3.PublicKey;
        grandParentProfile: web3.PublicKey;
        greatGrandParentProfile: web3.PublicKey;
        ggreateGrandParentProfile: web3.PublicKey;
        genesisProfile: web3.PublicKey;
        currentParentProfileHolderAta: web3.PublicKey;
        currentGrandParentProfileHolderAta: web3.PublicKey;
        currentGreatGrandParentProfileHolderAta: web3.PublicKey;
        currentGgreatGrandParentProfileHolderAta: web3.PublicKey;
        currentGenesisProfileHolderAta: web3.PublicKey;
        currentParentProfileHolder: web3.PublicKey;
        currentGrandParentProfileHolder: web3.PublicKey;
        currentGreatGrandParentProfileHolder: web3.PublicKey;
        currentGgreatGrandParentProfileHolder: web3.PublicKey;
        currentGenesisProfileHolder: web3.PublicKey;
        parentProfileHolderOposAta: web3.PublicKey;
        grandParentProfileHolderOposAta: web3.PublicKey;
        greatGrandParentProfileHolderOposAta: web3.PublicKey;
        ggreatGrandParentProfileHolderOposAta: web3.PublicKey;
        genesisProfileHolderOposAta: web3.PublicKey;
    }>;
    __getMetadata(mint: web3.PublicKey | string): Promise<Metadata>;
    getUserInfo(input: CommonInfo): Promise<UserInfo>;
    getCommonInfo(): Promise<CommonInfo>;
    getLineageInfoByProfile(profile: web3.PublicKey | string): Promise<ParsedLineageInfo>;
    getLineageInfoBySft(activationToken: web3.PublicKey | string): Promise<{
        profile: string;
        lineage: ParsedLineageInfo;
    }>;
    getProfileInfo(profileId: web3.PublicKey | string): Promise<{
        profileName: string;
        userName: string;
        profileMint: string;
        seniority: number;
        generation: number;
        totalChild: number;
        parentProfile: {
            profileName: string;
            userName: string;
            profileMint: string;
        };
        grandParentProfile: {
            profileName: string;
            userName: string;
            profileMint: string;
        };
        greatGrandParentProfile: {
            profileName: string;
            userName: string;
            profileMint: string;
        };
        ggreatGrandParentProfile: {
            profileName: string;
            userName: string;
            profileMint: string;
        };
    } | null>;
}
