import { AnchorProvider, Program, web3, BN } from "@project-serum/anchor";
import { Wallet as AWallet } from '@project-serum/anchor/dist/browser/src/provider'
import { TOKEN_PROGRAM_ID, } from "@project-serum/anchor/dist/cjs/utils/token";
// import {} from "@solana/spl-token"
import { IDL, Sop } from "./sop";
import {
  CommonInfo,
  LineageInfo,
  ParsedLineageInfo,
  MainState,
  Result,
  TxPassType,
  UserInfo,
  _MintProfileByAtInput,
  _MintSubscriptionToken,
} from "./web3Types";
import { Metadata, TokenStandard } from '@metaplex-foundation/mpl-token-metadata'
import { BaseMpl } from "./base/baseMpl";
import { web3Consts } from './web3Consts'
import { getAssociatedTokenAddressSync, unpackAccount, getAccount as getTokenAccount } from "@solana/spl-token";
import { Metaplex, Metadata as MetadataM } from '@metaplex-foundation/js'
import { BaseSpl } from "./base/baseSpl";
import { deployJsonData } from "./utils";

const {
  systemProgram,
  associatedTokenProgram,
  mplProgram,
  tokenProgram,
  sysvarInstructions,
  Seeds,
  oposToken,
  LAMPORTS_PER_OPOS,
  addressLookupTableProgram,
} = web3Consts;
const log = console.log;

export class Connectivity {
  programId: web3.PublicKey;
  provider: AnchorProvider;
  txis: web3.TransactionInstruction[] = [];
  extraSigns: web3.Keypair[] = [];
  multiSignInfo: any[] = [];
  program: Program<Sop>;
  mainState: web3.PublicKey;
  connection: web3.Connection;
  metaplex: Metaplex
  baseSpl: BaseSpl
  cacheMeta: Map<String, Metadata> = new Map();

  constructor(wallet: AWallet, web3Config: { endpoint: string, programId: string }) {
    const connection = new web3.Connection(web3Config.endpoint, { commitment: 'confirmed' });
    const provider = new AnchorProvider(
      connection, wallet,
      { commitment: 'confirmed' }
    )

    this.provider = provider;
    this.connection = provider.connection
    this.programId = new web3.PublicKey(web3Config.programId)
    this.program = new Program(IDL, this.programId, this.provider);
    this.mainState = web3.PublicKey.findProgramAddressSync(
      [Seeds.mainState],
      this.programId
    )[0];
    this.metaplex = new Metaplex(this.connection);
    this.baseSpl = new BaseSpl(this.connection)
  }

  reinit() {
    this.txis = [];
    this.extraSigns = [];
    this.multiSignInfo = [];
  }

  ixCallBack = (ixs?: web3.TransactionInstruction[]) => {
    if (ixs) {
      this.txis.push(...ixs)
    }
  }
  __getProfileStateAccount(mint: web3.PublicKey | string): web3.PublicKey {
    if (typeof mint == 'string') mint = new web3.PublicKey(mint)
    return web3.PublicKey.findProgramAddressSync([
      Seeds.profileState,
      mint.toBuffer()
    ], this.programId)[0]
  }

  __getCollectionStateAccount(mint: web3.PublicKey): web3.PublicKey {
    return web3.PublicKey.findProgramAddressSync([
      Seeds.collectionState,
      mint.toBuffer()
    ], this.programId)[0]
  }

  __getActivationTokenStateAccount(mint: web3.PublicKey): web3.PublicKey {
    return web3.PublicKey.findProgramAddressSync([
      Seeds.activationTokenState,
      mint.toBuffer()
    ], this.programId)[0]
  }

  __getValutAccount(profile: web3.PublicKey): web3.PublicKey {
    return web3.PublicKey.findProgramAddressSync([
      Seeds.vault,
      profile.toBuffer()
    ], this.programId)[0]
  }

  __getActMintingCheckAccount(token: web3.PublicKey): web3.PublicKey {
    return web3.PublicKey.findProgramAddressSync([
      Seeds.actMintingCheck,
      token.toBuffer()
    ], this.programId)[0]
  }

  // async initActivationToken(input: { profile: web3.PublicKey | string, name: string, symbol?: string, uri?: string, amount?: number }): Promise<Result<TxPassType<{ activationToken: string }>, any>> {
  //   try {
  //     this.reinit();
  //     const user = this.provider.publicKey;
  //     if (!user) throw "Wallet not found"
  //
  //     let { profile, name, symbol, uri, amount } = input
  //     amount = amount ?? 1
  //     symbol = symbol ?? ""
  //     uri = uri ?? ""
  //     if (typeof profile == 'string') profile = new web3.PublicKey(profile)
  //
  //     const mintKp = web3.Keypair.generate();
  //     const activationToken = mintKp.publicKey;
  //     const { ata: userProfileAta } = await this.baseSpl.__getOrCreateTokenAccountInstruction({ mint: profile, owner: user }, this.ixCallBack)
  //     const profileState = this.__getProfileStateAccount(profile)
  //     const profileEdition = BaseMpl.getEditionAccount(profile)
  //     const activationTokenState = this.__getActivationTokenStateAccount(activationToken)
  //     const userActivationTokenAta = getAssociatedTokenAddressSync(activationToken, user);
  //     const profileMetadata = BaseMpl.getMetadataAccount(profile)
  //     const activationTokenMetadata = BaseMpl.getMetadataAccount(activationToken)
  //     const profileCollectionAuthorityRecord = BaseMpl.getCollectionAuthorityRecordAccount(profile, this.mainState);
  //
  //     const ix = await this.program.methods.initActivationToken(name, symbol, uri,new BN(amount) ).accounts({
  //       user,
  //       mainState: this.mainState,
  //       activationToken,
  //       profile,
  //       profileState,
  //       profileMetadata,
  //       profileEdition,
  //       userProfileAta,
  //       profileCollectionAuthorityRecord,
  //       sysvarInstructions,
  //       activationTokenState,
  //       userActivationTokenAta,
  //       activationTokenMetadata,
  //       associatedTokenProgram,
  //       mplProgram,
  //       tokenProgram,
  //       systemProgram,
  //     }).instruction()
  //     this.txis.push(ix)
  //
  //     const tx = new web3.Transaction().add(...this.txis)
  //     const signature = await this.provider.sendAndConfirm(tx, [mintKp]);
  //
  //     return { Ok: { signature, info: { activationToken: activationToken.toBase58() } } }
  //   } catch (error) {
  //     log({ error })
  //     return { Err: error }
  //   }
  // }

  async airdropTokens(commonInfo: CommonInfo): Promise<Result<TxPassType<{ activationToken: string }>, any>> {
    try {
      this.reinit();
      this.baseSpl.__reinit();
      const user = this.provider.publicKey;
      if (!user) throw "Wallet not found"
      let { activationTokenId } = commonInfo
      const activationToken = new web3.PublicKey(activationTokenId)
      const userActivationAta = getAssociatedTokenAddressSync(activationToken, user)
      const userOposAta = getAssociatedTokenAddressSync(oposToken, user)
      const mainStateOposAta = getAssociatedTokenAddressSync(oposToken, this.mainState, true)

      const signature = await this.program.methods.airdropTokens().accounts({
        user,
        userActivationAta,
        activationToken,
        oposToken,
        userOposAta,
        mainState: this.mainState,
        mainStateOposAta,
        associatedTokenProgram,
        tokenProgram,
        systemProgram,
      }).rpc();

      // const tx = new web3.Transaction().add(ix)
      // const signature = await this.provider.sendAndConfirm(tx)

      return {
        Ok: { signature, info: { activationToken: activationToken.toBase58() } }
      }
    } catch (error) { return { Err: error } }
  }

  async mintProfileByActivationToken(input: _MintProfileByAtInput, commonInfo: CommonInfo): Promise<Result<TxPassType<{ profile: string }>, any>> {
    try {
      this.reinit();
      this.baseSpl.__reinit();
      const user = this.provider.publicKey;
      if (!user) throw "Wallet not found"
      let {
        name, username,
        description,
        activationToken,
        image
      } = input;
      username = username ?? ""
      const symbol = username
      description = description ?? ""
      image = image ?? ""

      const {
        commonLut: _commonLut,
        genesisProfileId: _genesisProfile,
      } = commonInfo
      if (typeof activationToken == 'string') activationToken = new web3.PublicKey(activationToken)
      const genesisProfile = new web3.PublicKey(_genesisProfile)
      const commonLut = new web3.PublicKey(_commonLut)

      const activationTokenState = this.__getActivationTokenStateAccount(activationToken)
      const activationTokenStateInfo = await this.program.account.activationTokenState.fetch(activationTokenState)
      const parentProfile = activationTokenStateInfo.parentProfile;
      const parentProfileStateInfo = await this.program.account.profileState.fetch(this.__getProfileStateAccount(parentProfile))
      const lut = parentProfileStateInfo.lut;
      const parentProfileNftInfo = await this.metaplex.nfts().findByMint({ mintAddress: parentProfile, loadJsonMetadata: false })
      const collection = parentProfileNftInfo?.collection?.address
      if (!collection) return { Err: "Collection info not found" }
      const collectionMetadata = BaseMpl.getMetadataAccount(collection)
      const collectionEdition = BaseMpl.getEditionAccount(collection)
      const collectionAuthorityRecord = BaseMpl.getCollectionAuthorityRecordAccount(collection, this.mainState)
      const mintKp = web3.Keypair.generate()
      const profile = mintKp.publicKey
      const userProfileAta = getAssociatedTokenAddressSync(profile, user);
      const { ata: userActivationTokenAta } = await this.baseSpl.__getOrCreateTokenAccountInstruction({ mint: activationToken, owner: user }, this.ixCallBack)
      const activationTokenMetadata = BaseMpl.getMetadataAccount(activationToken)
      const profileMetadata = BaseMpl.getMetadataAccount(profile)
      const profileEdition = BaseMpl.getEditionAccount(profile)
      const profileState = this.__getProfileStateAccount(profile)
      const parentProfileMetadata = BaseMpl.getMetadataAccount(parentProfile)
      const parentProfileState = this.__getProfileStateAccount(parentProfile)
      const subCollectionAuthorityRecord = BaseMpl.getCollectionAuthorityRecordAccount(profile, this.mainState)
      const {
        //profiles
        // genesisProfile,
        // parentProfile,
        grandParentProfile,
        greatGrandParentProfile,
        ggreateGrandParentProfile,
        //
        currentGreatGrandParentProfileHolder,
        currentGgreatGrandParentProfileHolder,
        currentGrandParentProfileHolder,
        currentGenesisProfileHolder,
        currentParentProfileHolder,
        //
        currentParentProfileHolderAta,
        currentGenesisProfileHolderAta,
        currentGrandParentProfileHolderAta,
        currentGreatGrandParentProfileHolderAta,
        currentGgreatGrandParentProfileHolderAta,
        //
        parentProfileHolderOposAta,
        genesisProfileHolderOposAta,
        grandParentProfileHolderOposAta,
        greatGrandParentProfileHolderOposAta,
        ggreatGrandParentProfileHolderOposAta,
      } = await this.__getProfileHoldersInfo(parentProfileStateInfo.lineage, parentProfile, genesisProfile)
      const userOposAta = getAssociatedTokenAddressSync(oposToken, user)
      try {
        const ataAccountInfo = await getTokenAccount(this.connection, userOposAta)
        const amount = parseInt("0x" + ataAccountInfo?.amount.toString())
        if (!amount || amount < commonInfo.profileMintingCost) return { Err: "Not enough Opos token" }
      } catch {
        return { Err: "Opos tokens not found !" }
      }

      // deployJson data
      const generation = parseInt("0x" + parentProfileStateInfo.lineage.generation.toString()) + 1;
      const ipfsHash = await deployJsonData({
        "name": name,
        "symbol": symbol,
        "image": image,
        "description": description,
        "external_url": `https://oposdao.com/${symbol}`,
        "family": "Mapshifting",
        "attributes": [
          {
            "trait_type": "Badge",
            "value": "Profile"
          },
          {
            "trait_type": "EcoSystem",
            "value": "OPOS"
          },
          {
            "trait_type": "Source",
            "value": "-"
          },
          {
            "trait_type": "Seniority",
            "value": generation
          }
        ]
      })
      if (!ipfsHash) {
        // alert("Failed to upload metadata")
        throw "Failed to upload metadata"
      }
      const uriHash = ipfsHash
      // const uri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`

      const recentSlot: number = (await this.connection.getSlot() - 200);
      const _buffer = Buffer.alloc(8);
      _buffer.writeBigUInt64LE(BigInt(recentSlot));
      const newLut = web3.PublicKey.findProgramAddressSync(
        [profileState.toBuffer(), _buffer],
        addressLookupTableProgram,
      )[0];

      let cuBudgetIncIx = web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 8000_00 })
      this.txis.push(cuBudgetIncIx)
      const ix = await this.program.methods.mintProfileByAt(
        name, symbol, uriHash, new BN(recentSlot)
      ).accounts({
        profile,
        user,
        oposToken,
        userProfileAta,
        mainState: this.mainState,
        collection,
        mplProgram,
        profileState,
        tokenProgram,
        systemProgram,
        addressLookupTableProgram,
        profileEdition,
        activationToken,
        profileMetadata,
        collectionEdition,
        collectionMetadata,
        newLut,
        parentProfileState,
        sysvarInstructions,
        userActivationTokenAta,
        associatedTokenProgram,
        //NOTE: Profile minting cost distributaion account
        userOposAta,

        //Profiles
        parentProfile,
        genesisProfile,
        grandParentProfile,
        greatGrandParentProfile,
        ggreateGrandParentProfile,

        //verification ata
        currentParentProfileHolderAta,
        currentGrandParentProfileHolderAta,
        currentGreatGrandParentProfileHolderAta,
        currentGgreatGrandParentProfileHolderAta,
        currentGenesisProfileHolderAta,
        // profile owners
        currentParentProfileHolder,
        currentGrandParentProfileHolder,
        currentGreatGrandParentProfileHolder,
        currentGgreatGrandParentProfileHolder,
        currentGenesisProfileHolder,

        // holder opos ata
        parentProfileHolderOposAta,
        grandParentProfileHolderOposAta,
        greatGrandParentProfileHolderOposAta,
        ggreatGrandParentProfileHolderOposAta,
        genesisProfileHolderOposAta,
      }).instruction()
      this.txis.push(ix)

      const commonLutInfo = await (await (this.connection.getAddressLookupTable(commonLut))).value
      if (commonLutInfo == null) throw "Unable to fetch LUT info"
      const lutsInfo = [commonLutInfo]
      if (lut.toBase58() != systemProgram.toBase58()) {
        const res = await (await (this.connection.getAddressLookupTable(lut))).value
        if (res == null) throw "Unable to fetch LUT info"
        lutsInfo.push(res)
      }
      const blockhash = (await this.connection.getLatestBlockhash()).blockhash
      const message = new web3.TransactionMessage({
        payerKey: this.provider.publicKey,
        recentBlockhash: blockhash,
        instructions: [...this.txis],
      }).compileToV0Message(lutsInfo);

      const tx = new web3.VersionedTransaction(message);
      tx.sign([mintKp])
      this.txis = []
      tx.sign([mintKp])
      const signature = await this.provider.sendAndConfirm(tx as any)

      return {
        Ok: {
          signature, info: { profile: profile.toBase58() }
        }
      }
    } catch (error) {
      log({ error })
      return { Err: error };
    }
  }

  async _initSubscriptionBadge(input: { profile: web3.PublicKey | string, name: string, symbol?: string, uri?: string, amount?: number }): Promise<Result<TxPassType<{ subscriptionToken: string }>, any>> {
    try {
      const user = this.provider.publicKey;
      this.reinit()
      let { profile, name, symbol, uri, amount } = input;
      amount = amount ?? 1
      symbol = symbol ?? ""
      uri = uri ?? ""
      log({
        name,
        symbol,
        uri
      })

      if (typeof profile == 'string') profile = new web3.PublicKey(profile)
      const profileState = this.__getProfileStateAccount(profile)
      const profileStateInfo = await this.program.account.profileState.fetch(profileState)
      if (profileStateInfo.activationToken) return { Ok: { signature: "", info: { subscriptionToken: profileStateInfo.activationToken.toBase58() } } }
      const profileMetadata = BaseMpl.getMetadataAccount(profile)
      const profileEdition = BaseMpl.getEditionAccount(profile)
      const profileCollectionAuthorityRecord = BaseMpl.getCollectionAuthorityRecordAccount(profile, this.mainState)
      const { ata: userProfileAta } = await this.baseSpl.__getOrCreateTokenAccountInstruction({ mint: profile, owner: user }, this.ixCallBack)
      const activationTokenKp = web3.Keypair.generate();
      const activationToken = activationTokenKp.publicKey
      const activationTokenMetadata = BaseMpl.getMetadataAccount(activationToken)
      const activationTokenState = this.__getActivationTokenStateAccount(activationToken)
      const userActivationTokenAta = getAssociatedTokenAddressSync(activationToken, user)

      const ix = await this.program.methods.initActivationToken(name, symbol, uri, new BN(amount)).accounts({
        profile,
        mainState: this.mainState,
        user,
        associatedTokenProgram,
        mplProgram,
        profileState,
        tokenProgram,
        systemProgram,
        profileEdition,
        userProfileAta,
        activationToken,
        profileMetadata,
        sysvarInstructions,
        activationTokenState,
        userActivationTokenAta,
        activationTokenMetadata,
        profileCollectionAuthorityRecord,
      }).instruction()
      this.txis.push(ix)

      const tx = new web3.Transaction().add(...this.txis)
      const signature = await this.provider.sendAndConfirm(tx, [activationTokenKp]);
      return { Ok: { signature, info: { subscriptionToken: activationToken.toBase58() } } }
    } catch (e) {
      log({ error: e })
      return { Err: e };
    }
  }

  async _mintSubscriptionToken(input: _MintSubscriptionToken): Promise<Result<TxPassType<{ subscriptionToken: string }>, any>> {
    try {
      this.reinit();
      const user = this.provider.publicKey;
      if (!user) throw "Wallet not found"
      let {
        subscriptionToken,
        receiver,
        profile: parentProfile,
        amount
      } = input;
      amount = amount ?? 1

      let subscriptionTokenState: web3.PublicKey;
      if (!subscriptionToken) {
        if (!parentProfile) throw "Parent Profile not found"
        if (typeof parentProfile == 'string') parentProfile = new web3.PublicKey(parentProfile)
        const parentProfileStateInfo = await this.program.account.profileState.fetch(this.__getProfileStateAccount(parentProfile))
        if (!parentProfileStateInfo.activationToken) throw "Subscription Token not initialised"
        subscriptionToken = parentProfileStateInfo.activationToken;
        subscriptionTokenState = this.__getActivationTokenStateAccount(subscriptionToken)
      } else {
        if (typeof subscriptionToken == 'string') subscriptionToken = new web3.PublicKey(subscriptionToken)
        subscriptionTokenState = this.__getActivationTokenStateAccount(subscriptionToken)
        const activationTokenStateInfo = await this.program.account.activationTokenState.fetch(subscriptionTokenState)
        parentProfile = activationTokenStateInfo.parentProfile;
      }

      if (!receiver) receiver = user;
      if (typeof receiver == 'string') receiver = new web3.PublicKey(receiver)
      const { ata: receiverAta } = await this.baseSpl.__getOrCreateTokenAccountInstruction({ mint: subscriptionToken, owner: receiver }, this.ixCallBack)

      // const profile = activationTokenStateInfo.parentProfile
      const profileState = this.__getProfileStateAccount(parentProfile)
      const { ata: minterProfileAta } = await this.baseSpl.__getOrCreateTokenAccountInstruction({ mint: parentProfile, owner: user }, this.ixCallBack)
      const ix = await this.program.methods.mintActivationToken(new BN(amount)).accounts({
        activationTokenState: subscriptionTokenState,
        tokenProgram,
        activationToken: subscriptionToken,
        profile: parentProfile,
        profileState,
        minterProfileAta,
        mainState: this.mainState,
        minter: user,
        receiverAta,
      }).instruction()
      this.txis.push(ix)

      const tx = new web3.Transaction().add(...this.txis)
      this.txis = []
      const signature = await this.provider.sendAndConfirm(tx)
      return { Ok: { signature, info: { subscriptionToken: subscriptionToken.toBase58() } } }
    } catch (error) {
      log({ error })
      return { Err: error }
    }
  }

  async mintSubscriptionBadge(
    input: _MintSubscriptionToken,
    metadata?: { image?: string }
  ): Promise<Result<TxPassType<{ subscriptionToken: string }>, any>> {
    let {
      profile,
      subscriptionToken,
      receiver,
      amount,
    } = input;

    if (subscriptionToken) return await this._mintSubscriptionToken(input)
    if (!profile) throw "Profile Id not provided"

    if (typeof profile == 'string') profile = new web3.PublicKey(profile)
    const profileStateAccount = this.__getProfileStateAccount(profile)
    const profileStateInfo = await this.program.account.profileState.fetch(profileStateAccount)

    if (profileStateInfo.activationToken) {
      log({ activationToken: profileStateInfo.activationToken.toBase58() })
      const res = await this._mintSubscriptionToken(input);
      return res;
    } else {
      // if (!metadata) throw "Subscription token metadata not found"
      if (!metadata) metadata = { image: "" }
      let { image } = metadata;
      image = image ?? ""
      const profileMetadata = await this.metaplex.nfts().findByMint({ mintAddress: profile })
      const profileName = profileMetadata.name;
      const username = profileMetadata.symbol;

      const name = `Subscribe to ${username}`
      const symbol = `${username}SUB`
      const description = `${username} invites you to subscribe to their feed on OPOS DAO`
      const external_url = `https://oposdao.com/${username}`

      const ipfsHash = await deployJsonData({
        "name": name,
        "symbol": symbol,
        "description": description,
        "image": image,
        "external_url": external_url,
        "family": "Mapshifting",
        "attributes": [
          {
            "trait_type": "Badge",
            "value": "Subscription"
          },
          {
            "trait_type": "EcoSystem",
            "value": "OPOSECO",
          },
          {
            "trait_type": "Profile",
            "value": username
          },
          {
            "trait_type": "Seniority",
            "value": parseInt("0x" + profileStateInfo.lineage.generation.toString())
          }
        ],
      })
      if (!ipfsHash) {
        // alert("Failed to upload metadata")
        throw "Failed to upload metadata"
      }
      const uri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      const res = await this._initSubscriptionBadge({
        profile,
        name,
        symbol,
        uri,
        amount
      })
      return res
    }
  }

  async mintOffer(input: {
    profile: web3.PublicKey | string,
    name: string,
    symbol?: string,
    image?: string,
    description?: string
  }): Promise<Result<TxPassType<{ offer: string }>, any>> {
    try {
      const user = this.provider.publicKey;
      this.reinit()
      let { profile, name, symbol, image, description } = input;
      if (typeof profile == 'string') profile = new web3.PublicKey(profile)
      symbol = symbol ?? ""
      image = image ?? ""
      description = description ?? ""

      const profileMetadataInfo = await this.metaplex.nfts().findByMint({ mintAddress: profile })
      const profileName = profileMetadataInfo.name
      const username = profileMetadataInfo.symbol;
      const ipfsHash = await deployJsonData({
        "name": name,
        "symbol": symbol,
        "description": description,
        "image": image,
        "external_url": `https://oposdao.com/profile/${symbol}`,
        "family": "Mapshifting",
        "attributes": [
          {
            "trait_type": "Badge",
            "value": "Offer"
          },
          {
            "trait_type": "EcoSystem",
            "value": "OPOS",
          },
          {
            "trait_type": "profile",
            "value": profileName
          },
          {
            "trait_type": "Creator",
            "value": username
          },
        ],
      })

      if (!ipfsHash) {
        // alert("Failed to upload metadata")
        throw "Failed to upload metadata"
      }
      const uri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`

      const profileState = this.__getProfileStateAccount(profile)
      const profileMetadata = BaseMpl.getMetadataAccount(profile)
      const profileEdition = BaseMpl.getEditionAccount(profile)
      const profileCollectionAuthorityRecord = BaseMpl.getCollectionAuthorityRecordAccount(profile, this.mainState)
      const { ata: userProfileAta } = await this.baseSpl.__getOrCreateTokenAccountInstruction({ mint: profile, owner: user }, this.ixCallBack)
      const mintKp = web3.Keypair.generate();
      const offer = mintKp.publicKey
      const offerMetadata = BaseMpl.getMetadataAccount(offer)
      const offerEdition = BaseMpl.getEditionAccount(offer)
      const userOfferAta = getAssociatedTokenAddressSync(offer, user)

      const { ixs: mintIxs } = await this.baseSpl.__getCreateTokenInstructions({
        mintAuthority: user,
        mintKeypair: mintKp,
        mintingInfo: {
          tokenAmount: 1,
        }
      })
      this.txis.push(...mintIxs)

      const ix = await this.program.methods.mintOffer(name, symbol, uri).accounts({
        profile,
        mainState: this.mainState,
        user,
        associatedTokenProgram,
        mplProgram,
        profileState,
        tokenProgram,
        systemProgram,
        profileEdition,
        userProfileAta,
        offer,
        offerEdition,
        profileMetadata,
        sysvarInstructions,
        userOfferAta,
        offerMetadata,
      }).instruction()
      this.txis.push(ix)

      const tx = new web3.Transaction().add(...this.txis)
      const signature = await this.provider.sendAndConfirm(tx, [mintKp]);
      return { Ok: { signature, info: { offer: offer.toBase58() } } }
    } catch (e) {
      log({ error: e })
      return { Err: e };
    }
  }

  async __getProfileHoldersInfo(input: LineageInfo, parentProfile: web3.PublicKey, genesisProfile: web3.PublicKey): Promise<{
    //profiles:
    parentProfile: web3.PublicKey,
    grandParentProfile: web3.PublicKey,
    greatGrandParentProfile: web3.PublicKey,
    ggreateGrandParentProfile: web3.PublicKey,
    genesisProfile: web3.PublicKey,
    //Profile holder ata
    currentParentProfileHolderAta: web3.PublicKey,
    currentGrandParentProfileHolderAta: web3.PublicKey,
    currentGreatGrandParentProfileHolderAta: web3.PublicKey,
    currentGgreatGrandParentProfileHolderAta: web3.PublicKey,
    currentGenesisProfileHolderAta: web3.PublicKey,
    // profile owners
    currentParentProfileHolder: web3.PublicKey,
    currentGrandParentProfileHolder: web3.PublicKey,
    currentGreatGrandParentProfileHolder: web3.PublicKey,
    currentGgreatGrandParentProfileHolder: web3.PublicKey,
    currentGenesisProfileHolder: web3.PublicKey,
    // opos accounts
    parentProfileHolderOposAta: web3.PublicKey,
    grandParentProfileHolderOposAta: web3.PublicKey,
    greatGrandParentProfileHolderOposAta: web3.PublicKey,
    ggreatGrandParentProfileHolderOposAta: web3.PublicKey,
    genesisProfileHolderOposAta: web3.PublicKey,
  }> {
    const grandParentProfile = input.parent
    const greatGrandParentProfile = input.grandParent;
    const ggreateGrandParentProfile = input.greatGrandParent;

    const currentParentProfileHolderAta = (await this.connection.getTokenLargestAccounts(parentProfile)).value[0].address
    const currentGrandParentProfileHolderAta = (await this.connection.getTokenLargestAccounts(grandParentProfile)).value[0].address
    const currentGreatGrandParentProfileHolderAta = (await this.connection.getTokenLargestAccounts(greatGrandParentProfile)).value[0].address
    const currentGgreatGrandParentProfileHolderAta = (await this.connection.getTokenLargestAccounts(ggreateGrandParentProfile)).value[0].address
    const currentGenesisProfileHolderAta = (await this.connection.getTokenLargestAccounts(genesisProfile)).value[0].address

    const atasInfo = await this.connection.getMultipleAccountsInfo([
      currentParentProfileHolderAta,
      currentGrandParentProfileHolderAta,
      currentGreatGrandParentProfileHolderAta,
      currentGgreatGrandParentProfileHolderAta,
      currentGenesisProfileHolderAta
    ])

    const currentParentProfileHolder = unpackAccount(currentParentProfileHolderAta, atasInfo[0]).owner
    const currentGrandParentProfileHolder = unpackAccount(currentGrandParentProfileHolderAta, atasInfo[1]).owner
    const currentGreatGrandParentProfileHolder = unpackAccount(currentGreatGrandParentProfileHolderAta, atasInfo[2]).owner
    const currentGgreatGrandParentProfileHolder = unpackAccount(currentGgreatGrandParentProfileHolderAta, atasInfo[3]).owner
    const currentGenesisProfileHolder = unpackAccount(currentGenesisProfileHolderAta, atasInfo[4]).owner

    return {
      //profiles:
      parentProfile,
      grandParentProfile,
      greatGrandParentProfile,
      ggreateGrandParentProfile,
      genesisProfile,
      // profile holder profile ata
      currentParentProfileHolderAta,
      currentGrandParentProfileHolderAta,
      currentGreatGrandParentProfileHolderAta,
      currentGgreatGrandParentProfileHolderAta,
      currentGenesisProfileHolderAta,

      // profile holders
      currentParentProfileHolder,
      currentGrandParentProfileHolder,
      currentGreatGrandParentProfileHolder,
      currentGgreatGrandParentProfileHolder,
      currentGenesisProfileHolder,

      // profile holder oposAta
      parentProfileHolderOposAta: getAssociatedTokenAddressSync(oposToken, currentParentProfileHolder),
      grandParentProfileHolderOposAta: getAssociatedTokenAddressSync(oposToken, currentGrandParentProfileHolder),
      greatGrandParentProfileHolderOposAta: getAssociatedTokenAddressSync(oposToken, currentGreatGrandParentProfileHolder),
      ggreatGrandParentProfileHolderOposAta: getAssociatedTokenAddressSync(oposToken, currentGgreatGrandParentProfileHolder),
      genesisProfileHolderOposAta: getAssociatedTokenAddressSync(oposToken, currentGenesisProfileHolder),
    }
  }

  async __getMetadata(mint: web3.PublicKey | string) {
    if (typeof mint == 'string') mint = new web3.PublicKey(mint)

    const cache = this.cacheMeta.get(mint.toBase58());
    if (cache) return cache

    const metadataAccount = BaseMpl.getMetadataAccount(mint)
    const info = await this.connection.getAccountInfo(metadataAccount)
    if (!info) throw "Metadata Not found"

    const metadata = Metadata.fromAccountInfo(info)[0]
    this.cacheMeta.set(mint.toBase58(), metadata)
    return metadata
  }

  // Data fetch utils
  async getUserInfo(input: CommonInfo): Promise<UserInfo> {
    const user = this.provider.publicKey
    if (!user) throw "Wallet not found"
    const { activationTokenId,
      genesisProfileId,
      profileCollectionId,
    } = input
    const profileCollection = new web3.PublicKey(profileCollectionId)
    const genesisProfile = new web3.PublicKey(genesisProfileId)
    const activationToken = new web3.PublicKey(activationTokenId)
    const userActivationTokenAta = getAssociatedTokenAddressSync(activationToken, user)
    const userOposAta = getAssociatedTokenAddressSync(oposToken, user);
    const infoes = await this.connection.getMultipleAccountsInfo([user, userOposAta, getAssociatedTokenAddressSync(activationToken, user)])

    const solBalance = infoes[0]?.lamports ?? 0 / 1000_000_000
    let oposTokenBalance = 0;
    let activationTokenBalance = 0;
    if (infoes[1]) {
      const tokenAccount = unpackAccount(userOposAta, infoes[1])
      oposTokenBalance = (parseInt(tokenAccount?.amount?.toString()) ?? 0) / LAMPORTS_PER_OPOS;
    }
    if (infoes[2]) {
      const tokenAccount = unpackAccount(userActivationTokenAta, infoes[2])
      activationTokenBalance = parseInt(tokenAccount?.amount?.toString())
    }

    let response = (await this.connection.getTokenAccountsByOwner(user, {
      programId: TOKEN_PROGRAM_ID,
    })).value;

    const tokens: web3.PublicKey[] = []
    for (let { account, pubkey } of response) {
      const tk = unpackAccount(pubkey, account);
      if (tk.amount > 0) tokens.push(tk.mint)
    }
    const metadataAccounts = tokens.map((e) => BaseMpl.getMetadataAccount(e))
    //TODO: overAccount Info issue 
    const metadataAccountsInfo = await this.connection.getMultipleAccountsInfo(metadataAccounts)

    const profiles: Metadata[] = []
    const sfts = new Map<string, { sftMeta?: Metadata, profileId: string, profileInfo?: Metadata }>();
    const offers = new Map<string, { offerMeta?: Metadata, profileId: string, profileInfo?: Metadata }>();

    for (let account of metadataAccountsInfo) {
      try {
        if (!account) continue
        const metadata = Metadata.fromAccountInfo(account)[0]
        if (!metadata) continue
        const collectionInfo = metadata?.collection;
        if (!collectionInfo) continue
        if (collectionInfo?.key?.toBase58() == profileCollection.toBase58()) {
          profiles.push(metadata)
        } else {
          if (metadata.mint.toBase58() == input.activationTokenId) continue

          // flitering SFT and setting SFT info
          const creators = metadata.data.creators;
          if (!creators || creators.length == 0) continue;
          const first = creators[0]
          const second = creators[1]
          if (!second) continue

          if (first.verified && first.address.toBase58() == this.mainState.toBase58()) {
            const tokenStandard = metadata.tokenStandard
            if (tokenStandard == TokenStandard.NonFungible) offers.set(metadata.mint.toBase58(), { profileId: second.address.toBase58(), offerMeta: metadata })
            else sfts.set(metadata.mint.toBase58(), { profileId: second.address.toBase58(), sftMeta: metadata })
          }
        }
      } catch { }
    }

    //TODO: set sft's profile data of
    return {
      solBalance,
      oposTokenBalance,
      activationTokenBalance,
      profiles,
      sfts,
      offers
    }
  }

  async getCommonInfo(): Promise<CommonInfo> {
    const mainStateInfo = await this.program.account.mainState.fetch(this.mainState)
    const profileCollection = mainStateInfo.profileCollection;
    const profileCollectionState = await this.program.account.collectionState.fetch(this.__getCollectionStateAccount(profileCollection))
    const genesisProfile = profileCollectionState.genesisProfile;
    const genesisProfileInfo = await this.program.account.profileState.fetch(this.__getProfileStateAccount(genesisProfile))
    const activationTokenId = genesisProfileInfo.activationToken;

    return {
      oposTokenId: oposToken.toBase58(),
      profileCollectionId: profileCollection.toBase58(),
      genesisProfileId: genesisProfile.toBase58(),
      activationTokenId: activationTokenId?.toBase58() ?? "",
      commonLut: mainStateInfo.commonLut.toBase58(),
      profileMintingCost: parseInt(mainStateInfo.profileMintingCost.toString())
    }
  }

  async getLineageInfoByProfile(profile: web3.PublicKey | string): Promise<ParsedLineageInfo> {
    if (typeof profile == 'string') profile = new web3.PublicKey(profile)
    const profileInfo = await this.program.account.profileState.fetch(this.__getProfileStateAccount(profile))
    const parsedInfo: ParsedLineageInfo = JSON.parse(JSON.stringify(profileInfo.lineage))
    parsedInfo.generation = parseInt("0x" + parsedInfo?.generation)
    parsedInfo.totalChild = parseInt("0x" + parsedInfo?.totalChild)

    return parsedInfo;
  }

  async getLineageInfoBySft(activationToken: web3.PublicKey | string): Promise<{ profile: string, lineage: ParsedLineageInfo }> {
    if (typeof activationToken == 'string') activationToken = new web3.PublicKey(activationToken)
    const activationTokenInfo = await this.program.account.activationTokenState.fetch(this.__getActivationTokenStateAccount(activationToken))
    const profile = activationTokenInfo.parentProfile

    return {
      profile: profile.toBase58(),
      lineage: await this.getLineageInfoByProfile(profile)
    }
  }

  async getProfileInfo(profileId: web3.PublicKey | string) {
    try {
      if (typeof profileId == 'string') profileId = new web3.PublicKey(profileId)
      const profileInfo = await this.program.account.profileState.fetch(this.__getProfileStateAccount(profileId))
      const parentProfile = profileInfo.lineage.parent;
      const grandParentProfile = profileInfo.lineage.grandParent;
      const greatGrandParentProfile = profileInfo.lineage.greatGrandParent;
      const ggreatGrandParentProfile = profileInfo.lineage.ggreatGrandParent;
      const generation = parseInt("0x" + profileInfo.lineage.generation.toString())
      const seniority = generation;//NOTE: may be needed changes
      const totalChild = parseInt("0x" + profileInfo.lineage.totalChild.toString())

      const accountInfoes = await this.connection.getMultipleAccountsInfo([
        BaseMpl.getMetadataAccount(profileId),
        BaseMpl.getMetadataAccount(parentProfile),
        BaseMpl.getMetadataAccount(grandParentProfile),
        BaseMpl.getMetadataAccount(greatGrandParentProfile),
        BaseMpl.getMetadataAccount(ggreatGrandParentProfile),
      ])

      const profileMetadata = Metadata.fromAccountInfo(accountInfoes[0]!)[0]
      const parentProfileMetadata = Metadata.fromAccountInfo(accountInfoes[1]!)[0]
      const grandParentProfileMetadata = Metadata.fromAccountInfo(accountInfoes[2]!)[0]
      const greateGrandParentProfileMetadata = Metadata.fromAccountInfo(accountInfoes[3]!)[0]
      const ggreateGrandParentProfileMetadata = Metadata.fromAccountInfo(accountInfoes[4]!)[0]

      return {
        profileName: profileMetadata.data.name.split('\0')[0],
        userName: profileMetadata.data.symbol.split('\0')[0],
        profileMint: profileId.toBase58(),
        seniority,
        generation,
        totalChild,
        parentProfile: {
          profileName: parentProfileMetadata.data.name.split('\0')[0],
          userName: parentProfileMetadata.data.symbol.split('\0')[0],
          profileMint: parentProfile.toBase58()
        },
        grandParentProfile: {
          profileName: grandParentProfileMetadata.data.name.split('\0')[0],
          userName: grandParentProfileMetadata.data.symbol.split('\0')[0],
          profileMint: grandParentProfile.toBase58()
        },
        greatGrandParentProfile: {
          profileName: greateGrandParentProfileMetadata.data.name.split('\0')[0],
          userName: greateGrandParentProfileMetadata.data.symbol.split('\0')[0],
          profileMint: greatGrandParentProfile.toBase58()
        },
        ggreatGrandParentProfile: {
          profileName: ggreateGrandParentProfileMetadata.data.name.split('\0')[0],
          userName: ggreateGrandParentProfileMetadata.data.symbol.split('\0')[0],
          profileMint: ggreatGrandParentProfile.toBase58()
        }
      }
    }
    catch (error) { log({ error }); return null }
  }
}
