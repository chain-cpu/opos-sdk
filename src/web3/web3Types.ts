import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { IdlAccounts, IdlTypes } from "@project-serum/anchor";
import { web3 } from '@project-serum/anchor';
import { Sop } from "./sop";

const mainStateTypeName = "mainState";
const profileStateTypeName = "profileState";
const lineageTypeName = "LineageInfo";

export type MainState = IdlAccounts<Sop>[typeof mainStateTypeName];
export type ProfileState = IdlAccounts<Sop>[typeof profileStateTypeName];
export type LineageInfo = IdlTypes<Sop>[typeof lineageTypeName];

const mainStateInputTypeName = "MainStateInput";
const mintProfileByAdminInput = "MintProfileByAdminInput"
export type MainStateInput = IdlTypes<Sop>[typeof mainStateInputTypeName];
export type MintProfileByAdminInput = IdlTypes<Sop>[typeof mintProfileByAdminInput];


//EXTRA (Out of IDL)
export type Result<T, E> = {
  Ok?: T;
  Err?: E;
};
export type TxPassType<Info> = { signature: string, info?: Info };

// export type _MintProfileInput = {
//   name?: string,
//   symbol?: string,
//   uri?: string,
//   parentProfile: string | web3.PublicKey
// }

export type _MintProfileByAtInput = {
  name: string,
  // symbol?: string,
  image?: string,
  username?: string,
  description?: string,
  // uri?: string,
  // uriHash?: string,
  activationToken: string | web3.PublicKey
  // genesisProfile: string | web3.PublicKey
  // commonLut: string | web3.PublicKey
}

export type _MintSubscriptionToken = {
  profile?: web3.PublicKey | string,
  subscriptionToken?: web3.PublicKey | string,
  receiver?: web3.PublicKey | string,
  amount?: number
}


//Connectivity 
export type CommonInfo = {
  oposTokenId: string,
  profileCollectionId: string;
  genesisProfileId: string;
  activationTokenId: string;
  commonLut: string
  profileMintingCost: number,
}

export type UserInfo = {
  solBalance: number;
  oposTokenBalance: number;
  activationTokenBalance: number;
  profiles: Metadata[];
  sfts: Map<string, {
    sftMeta?: Metadata;
    profileId: string;
    profileInfo?: Metadata;
  }>,
  offers: Map<string, {
    offerMeta?: Metadata;
    profileId: string;
    profileInfo?: Metadata;
  }>;
}

export type ParsedLineageInfo = {
  creator: string;
  parent: string;
  grandParent: string;
  greatGrandParent: string;
  ggreateGrandParent: string;
  generation: number;
  totalChild: number;
}

