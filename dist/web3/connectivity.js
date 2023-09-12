var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { AnchorProvider, Program, web3, BN } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID, } from "@project-serum/anchor/dist/cjs/utils/token";
// import {} from "@solana/spl-token"
import { IDL } from "./sop";
import { Metadata, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { BaseMpl } from "./base/baseMpl";
import { web3Consts } from './web3Consts';
import { getAssociatedTokenAddressSync, unpackAccount, getAccount as getTokenAccount } from "@solana/spl-token";
import { Metaplex } from '@metaplex-foundation/js';
import { BaseSpl } from "./base/baseSpl";
import { deployJsonData } from "./utils";
var systemProgram = web3Consts.systemProgram, associatedTokenProgram = web3Consts.associatedTokenProgram, mplProgram = web3Consts.mplProgram, tokenProgram = web3Consts.tokenProgram, sysvarInstructions = web3Consts.sysvarInstructions, Seeds = web3Consts.Seeds, oposToken = web3Consts.oposToken, LAMPORTS_PER_OPOS = web3Consts.LAMPORTS_PER_OPOS, addressLookupTableProgram = web3Consts.addressLookupTableProgram;
var log = console.log;
var Connectivity = /** @class */ (function () {
    function Connectivity(wallet, web3Config) {
        var _this = this;
        this.txis = [];
        this.extraSigns = [];
        this.multiSignInfo = [];
        this.cacheMeta = new Map();
        this.ixCallBack = function (ixs) {
            var _a;
            if (ixs) {
                (_a = _this.txis).push.apply(_a, ixs);
            }
        };
        var connection = new web3.Connection(web3Config.endpoint, { commitment: 'confirmed' });
        var provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
        this.provider = provider;
        this.connection = provider.connection;
        this.programId = new web3.PublicKey(web3Config.programId);
        this.program = new Program(IDL, this.programId, this.provider);
        this.mainState = web3.PublicKey.findProgramAddressSync([Seeds.mainState], this.programId)[0];
        this.metaplex = new Metaplex(this.connection);
        this.baseSpl = new BaseSpl(this.connection);
    }
    Connectivity.prototype.reinit = function () {
        this.txis = [];
        this.extraSigns = [];
        this.multiSignInfo = [];
    };
    Connectivity.prototype.__getProfileStateAccount = function (mint) {
        if (typeof mint == 'string')
            mint = new web3.PublicKey(mint);
        return web3.PublicKey.findProgramAddressSync([
            Seeds.profileState,
            mint.toBuffer()
        ], this.programId)[0];
    };
    Connectivity.prototype.__getCollectionStateAccount = function (mint) {
        return web3.PublicKey.findProgramAddressSync([
            Seeds.collectionState,
            mint.toBuffer()
        ], this.programId)[0];
    };
    Connectivity.prototype.__getActivationTokenStateAccount = function (mint) {
        return web3.PublicKey.findProgramAddressSync([
            Seeds.activationTokenState,
            mint.toBuffer()
        ], this.programId)[0];
    };
    Connectivity.prototype.__getValutAccount = function (profile) {
        return web3.PublicKey.findProgramAddressSync([
            Seeds.vault,
            profile.toBuffer()
        ], this.programId)[0];
    };
    Connectivity.prototype.__getActMintingCheckAccount = function (token) {
        return web3.PublicKey.findProgramAddressSync([
            Seeds.actMintingCheck,
            token.toBuffer()
        ], this.programId)[0];
    };
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
    Connectivity.prototype.airdropTokens = function (commonInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var user, activationTokenId, activationToken, userActivationAta, userOposAta, mainStateOposAta, signature, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.reinit();
                        this.baseSpl.__reinit();
                        user = this.provider.publicKey;
                        if (!user)
                            throw "Wallet not found";
                        activationTokenId = commonInfo.activationTokenId;
                        activationToken = new web3.PublicKey(activationTokenId);
                        userActivationAta = getAssociatedTokenAddressSync(activationToken, user);
                        userOposAta = getAssociatedTokenAddressSync(oposToken, user);
                        mainStateOposAta = getAssociatedTokenAddressSync(oposToken, this.mainState, true);
                        return [4 /*yield*/, this.program.methods.airdropTokens().accounts({
                                user: user,
                                userActivationAta: userActivationAta,
                                activationToken: activationToken,
                                oposToken: oposToken,
                                userOposAta: userOposAta,
                                mainState: this.mainState,
                                mainStateOposAta: mainStateOposAta,
                                associatedTokenProgram: associatedTokenProgram,
                                tokenProgram: tokenProgram,
                                systemProgram: systemProgram,
                            }).rpc()];
                    case 1:
                        signature = _a.sent();
                        // const tx = new web3.Transaction().add(ix)
                        // const signature = await this.provider.sendAndConfirm(tx)
                        return [2 /*return*/, {
                                Ok: { signature: signature, info: { activationToken: activationToken.toBase58() } }
                            }];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, { Err: error_1 }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Connectivity.prototype.mintProfileByActivationToken = function (input, commonInfo) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var user, name_1, username, description, activationToken, image, symbol, _commonLut, _genesisProfile, genesisProfile, commonLut, activationTokenState, activationTokenStateInfo, parentProfile, parentProfileStateInfo, lut, parentProfileNftInfo, collection, collectionMetadata, collectionEdition, collectionAuthorityRecord, mintKp, profile, userProfileAta, userActivationTokenAta, activationTokenMetadata, profileMetadata, profileEdition, profileState, parentProfileMetadata, parentProfileState, subCollectionAuthorityRecord, _b, 
            //profiles
            // genesisProfile,
            // parentProfile,
            grandParentProfile, greatGrandParentProfile, ggreateGrandParentProfile, 
            //
            currentGreatGrandParentProfileHolder, currentGgreatGrandParentProfileHolder, currentGrandParentProfileHolder, currentGenesisProfileHolder, currentParentProfileHolder, 
            //
            currentParentProfileHolderAta, currentGenesisProfileHolderAta, currentGrandParentProfileHolderAta, currentGreatGrandParentProfileHolderAta, currentGgreatGrandParentProfileHolderAta, 
            //
            parentProfileHolderOposAta, genesisProfileHolderOposAta, grandParentProfileHolderOposAta, greatGrandParentProfileHolderOposAta, ggreatGrandParentProfileHolderOposAta, userOposAta, ataAccountInfo, amount, _c, generation, ipfsHash, uriHash, recentSlot, _buffer, newLut, cuBudgetIncIx, ix, commonLutInfo, lutsInfo, res, blockhash, message, tx, signature, error_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 20, , 21]);
                        this.reinit();
                        this.baseSpl.__reinit();
                        user = this.provider.publicKey;
                        if (!user)
                            throw "Wallet not found";
                        name_1 = input.name, username = input.username, description = input.description, activationToken = input.activationToken, image = input.image;
                        username = username !== null && username !== void 0 ? username : "";
                        symbol = username;
                        description = description !== null && description !== void 0 ? description : "";
                        image = image !== null && image !== void 0 ? image : "";
                        _commonLut = commonInfo.commonLut, _genesisProfile = commonInfo.genesisProfileId;
                        if (typeof activationToken == 'string')
                            activationToken = new web3.PublicKey(activationToken);
                        genesisProfile = new web3.PublicKey(_genesisProfile);
                        commonLut = new web3.PublicKey(_commonLut);
                        activationTokenState = this.__getActivationTokenStateAccount(activationToken);
                        return [4 /*yield*/, this.program.account.activationTokenState.fetch(activationTokenState)];
                    case 1:
                        activationTokenStateInfo = _d.sent();
                        parentProfile = activationTokenStateInfo.parentProfile;
                        return [4 /*yield*/, this.program.account.profileState.fetch(this.__getProfileStateAccount(parentProfile))];
                    case 2:
                        parentProfileStateInfo = _d.sent();
                        lut = parentProfileStateInfo.lut;
                        return [4 /*yield*/, this.metaplex.nfts().findByMint({ mintAddress: parentProfile, loadJsonMetadata: false })];
                    case 3:
                        parentProfileNftInfo = _d.sent();
                        collection = (_a = parentProfileNftInfo === null || parentProfileNftInfo === void 0 ? void 0 : parentProfileNftInfo.collection) === null || _a === void 0 ? void 0 : _a.address;
                        if (!collection)
                            return [2 /*return*/, { Err: "Collection info not found" }];
                        collectionMetadata = BaseMpl.getMetadataAccount(collection);
                        collectionEdition = BaseMpl.getEditionAccount(collection);
                        collectionAuthorityRecord = BaseMpl.getCollectionAuthorityRecordAccount(collection, this.mainState);
                        mintKp = web3.Keypair.generate();
                        profile = mintKp.publicKey;
                        userProfileAta = getAssociatedTokenAddressSync(profile, user);
                        return [4 /*yield*/, this.baseSpl.__getOrCreateTokenAccountInstruction({ mint: activationToken, owner: user }, this.ixCallBack)];
                    case 4:
                        userActivationTokenAta = (_d.sent()).ata;
                        activationTokenMetadata = BaseMpl.getMetadataAccount(activationToken);
                        profileMetadata = BaseMpl.getMetadataAccount(profile);
                        profileEdition = BaseMpl.getEditionAccount(profile);
                        profileState = this.__getProfileStateAccount(profile);
                        parentProfileMetadata = BaseMpl.getMetadataAccount(parentProfile);
                        parentProfileState = this.__getProfileStateAccount(parentProfile);
                        subCollectionAuthorityRecord = BaseMpl.getCollectionAuthorityRecordAccount(profile, this.mainState);
                        return [4 /*yield*/, this.__getProfileHoldersInfo(parentProfileStateInfo.lineage, parentProfile, genesisProfile)];
                    case 5:
                        _b = _d.sent(), grandParentProfile = _b.grandParentProfile, greatGrandParentProfile = _b.greatGrandParentProfile, ggreateGrandParentProfile = _b.ggreateGrandParentProfile, currentGreatGrandParentProfileHolder = _b.currentGreatGrandParentProfileHolder, currentGgreatGrandParentProfileHolder = _b.currentGgreatGrandParentProfileHolder, currentGrandParentProfileHolder = _b.currentGrandParentProfileHolder, currentGenesisProfileHolder = _b.currentGenesisProfileHolder, currentParentProfileHolder = _b.currentParentProfileHolder, currentParentProfileHolderAta = _b.currentParentProfileHolderAta, currentGenesisProfileHolderAta = _b.currentGenesisProfileHolderAta, currentGrandParentProfileHolderAta = _b.currentGrandParentProfileHolderAta, currentGreatGrandParentProfileHolderAta = _b.currentGreatGrandParentProfileHolderAta, currentGgreatGrandParentProfileHolderAta = _b.currentGgreatGrandParentProfileHolderAta, parentProfileHolderOposAta = _b.parentProfileHolderOposAta, genesisProfileHolderOposAta = _b.genesisProfileHolderOposAta, grandParentProfileHolderOposAta = _b.grandParentProfileHolderOposAta, greatGrandParentProfileHolderOposAta = _b.greatGrandParentProfileHolderOposAta, ggreatGrandParentProfileHolderOposAta = _b.ggreatGrandParentProfileHolderOposAta;
                        userOposAta = getAssociatedTokenAddressSync(oposToken, user);
                        _d.label = 6;
                    case 6:
                        _d.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, getTokenAccount(this.connection, userOposAta)];
                    case 7:
                        ataAccountInfo = _d.sent();
                        amount = parseInt("0x" + (ataAccountInfo === null || ataAccountInfo === void 0 ? void 0 : ataAccountInfo.amount.toString()));
                        if (!amount || amount < commonInfo.profileMintingCost)
                            return [2 /*return*/, { Err: "Not enough Opos token" }];
                        return [3 /*break*/, 9];
                    case 8:
                        _c = _d.sent();
                        return [2 /*return*/, { Err: "Opos tokens not found !" }];
                    case 9:
                        generation = parseInt("0x" + parentProfileStateInfo.lineage.generation.toString()) + 1;
                        return [4 /*yield*/, deployJsonData({
                                "name": name_1,
                                "symbol": symbol,
                                "image": image,
                                "description": description,
                                "external_url": "https://oposdao.com/".concat(symbol),
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
                            })];
                    case 10:
                        ipfsHash = _d.sent();
                        if (!ipfsHash) {
                            // alert("Failed to upload metadata")
                            throw "Failed to upload metadata";
                        }
                        uriHash = ipfsHash;
                        return [4 /*yield*/, this.connection.getSlot()];
                    case 11:
                        recentSlot = ((_d.sent()) - 200);
                        _buffer = Buffer.alloc(8);
                        _buffer.writeBigUInt64LE(BigInt(recentSlot));
                        newLut = web3.PublicKey.findProgramAddressSync([profileState.toBuffer(), _buffer], addressLookupTableProgram)[0];
                        cuBudgetIncIx = web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 800000 });
                        this.txis.push(cuBudgetIncIx);
                        return [4 /*yield*/, this.program.methods.mintProfileByAt(name_1, symbol, uriHash, new BN(recentSlot)).accounts({
                                profile: profile,
                                user: user,
                                oposToken: oposToken,
                                userProfileAta: userProfileAta,
                                mainState: this.mainState,
                                collection: collection,
                                mplProgram: mplProgram,
                                profileState: profileState,
                                tokenProgram: tokenProgram,
                                systemProgram: systemProgram,
                                addressLookupTableProgram: addressLookupTableProgram,
                                profileEdition: profileEdition,
                                activationToken: activationToken,
                                profileMetadata: profileMetadata,
                                collectionEdition: collectionEdition,
                                collectionMetadata: collectionMetadata,
                                newLut: newLut,
                                parentProfileState: parentProfileState,
                                sysvarInstructions: sysvarInstructions,
                                userActivationTokenAta: userActivationTokenAta,
                                associatedTokenProgram: associatedTokenProgram,
                                //NOTE: Profile minting cost distributaion account
                                userOposAta: userOposAta,
                                //Profiles
                                parentProfile: parentProfile,
                                genesisProfile: genesisProfile,
                                grandParentProfile: grandParentProfile,
                                greatGrandParentProfile: greatGrandParentProfile,
                                ggreateGrandParentProfile: ggreateGrandParentProfile,
                                //verification ata
                                currentParentProfileHolderAta: currentParentProfileHolderAta,
                                currentGrandParentProfileHolderAta: currentGrandParentProfileHolderAta,
                                currentGreatGrandParentProfileHolderAta: currentGreatGrandParentProfileHolderAta,
                                currentGgreatGrandParentProfileHolderAta: currentGgreatGrandParentProfileHolderAta,
                                currentGenesisProfileHolderAta: currentGenesisProfileHolderAta,
                                // profile owners
                                currentParentProfileHolder: currentParentProfileHolder,
                                currentGrandParentProfileHolder: currentGrandParentProfileHolder,
                                currentGreatGrandParentProfileHolder: currentGreatGrandParentProfileHolder,
                                currentGgreatGrandParentProfileHolder: currentGgreatGrandParentProfileHolder,
                                currentGenesisProfileHolder: currentGenesisProfileHolder,
                                // holder opos ata
                                parentProfileHolderOposAta: parentProfileHolderOposAta,
                                grandParentProfileHolderOposAta: grandParentProfileHolderOposAta,
                                greatGrandParentProfileHolderOposAta: greatGrandParentProfileHolderOposAta,
                                ggreatGrandParentProfileHolderOposAta: ggreatGrandParentProfileHolderOposAta,
                                genesisProfileHolderOposAta: genesisProfileHolderOposAta,
                            }).instruction()];
                    case 12:
                        ix = _d.sent();
                        this.txis.push(ix);
                        return [4 /*yield*/, (this.connection.getAddressLookupTable(commonLut))];
                    case 13: return [4 /*yield*/, (_d.sent()).value];
                    case 14:
                        commonLutInfo = _d.sent();
                        if (commonLutInfo == null)
                            throw "Unable to fetch LUT info";
                        lutsInfo = [commonLutInfo];
                        if (!(lut.toBase58() != systemProgram.toBase58())) return [3 /*break*/, 17];
                        return [4 /*yield*/, (this.connection.getAddressLookupTable(lut))];
                    case 15: return [4 /*yield*/, (_d.sent()).value];
                    case 16:
                        res = _d.sent();
                        if (res == null)
                            throw "Unable to fetch LUT info";
                        lutsInfo.push(res);
                        _d.label = 17;
                    case 17: return [4 /*yield*/, this.connection.getLatestBlockhash()];
                    case 18:
                        blockhash = (_d.sent()).blockhash;
                        message = new web3.TransactionMessage({
                            payerKey: this.provider.publicKey,
                            recentBlockhash: blockhash,
                            instructions: __spreadArray([], this.txis, true),
                        }).compileToV0Message(lutsInfo);
                        tx = new web3.VersionedTransaction(message);
                        tx.sign([mintKp]);
                        this.txis = [];
                        tx.sign([mintKp]);
                        return [4 /*yield*/, this.provider.sendAndConfirm(tx)];
                    case 19:
                        signature = _d.sent();
                        return [2 /*return*/, {
                                Ok: {
                                    signature: signature,
                                    info: { profile: profile.toBase58() }
                                }
                            }];
                    case 20:
                        error_2 = _d.sent();
                        log({ error: error_2 });
                        return [2 /*return*/, { Err: error_2 }];
                    case 21: return [2 /*return*/];
                }
            });
        });
    };
    Connectivity.prototype._initSubscriptionBadge = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var user, profile, name_2, symbol, uri, amount, profileState, profileStateInfo, profileMetadata, profileEdition, profileCollectionAuthorityRecord, userProfileAta, activationTokenKp, activationToken, activationTokenMetadata, activationTokenState, userActivationTokenAta, ix, tx, signature, e_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        user = this.provider.publicKey;
                        this.reinit();
                        profile = input.profile, name_2 = input.name, symbol = input.symbol, uri = input.uri, amount = input.amount;
                        amount = amount !== null && amount !== void 0 ? amount : 1;
                        symbol = symbol !== null && symbol !== void 0 ? symbol : "";
                        uri = uri !== null && uri !== void 0 ? uri : "";
                        log({
                            name: name_2,
                            symbol: symbol,
                            uri: uri
                        });
                        if (typeof profile == 'string')
                            profile = new web3.PublicKey(profile);
                        profileState = this.__getProfileStateAccount(profile);
                        return [4 /*yield*/, this.program.account.profileState.fetch(profileState)];
                    case 1:
                        profileStateInfo = _b.sent();
                        if (profileStateInfo.activationToken)
                            return [2 /*return*/, { Ok: { signature: "", info: { subscriptionToken: profileStateInfo.activationToken.toBase58() } } }];
                        profileMetadata = BaseMpl.getMetadataAccount(profile);
                        profileEdition = BaseMpl.getEditionAccount(profile);
                        profileCollectionAuthorityRecord = BaseMpl.getCollectionAuthorityRecordAccount(profile, this.mainState);
                        return [4 /*yield*/, this.baseSpl.__getOrCreateTokenAccountInstruction({ mint: profile, owner: user }, this.ixCallBack)];
                    case 2:
                        userProfileAta = (_b.sent()).ata;
                        activationTokenKp = web3.Keypair.generate();
                        activationToken = activationTokenKp.publicKey;
                        activationTokenMetadata = BaseMpl.getMetadataAccount(activationToken);
                        activationTokenState = this.__getActivationTokenStateAccount(activationToken);
                        userActivationTokenAta = getAssociatedTokenAddressSync(activationToken, user);
                        return [4 /*yield*/, this.program.methods.initActivationToken(name_2, symbol, uri, new BN(amount)).accounts({
                                profile: profile,
                                mainState: this.mainState,
                                user: user,
                                associatedTokenProgram: associatedTokenProgram,
                                mplProgram: mplProgram,
                                profileState: profileState,
                                tokenProgram: tokenProgram,
                                systemProgram: systemProgram,
                                profileEdition: profileEdition,
                                userProfileAta: userProfileAta,
                                activationToken: activationToken,
                                profileMetadata: profileMetadata,
                                sysvarInstructions: sysvarInstructions,
                                activationTokenState: activationTokenState,
                                userActivationTokenAta: userActivationTokenAta,
                                activationTokenMetadata: activationTokenMetadata,
                                profileCollectionAuthorityRecord: profileCollectionAuthorityRecord,
                            }).instruction()];
                    case 3:
                        ix = _b.sent();
                        this.txis.push(ix);
                        tx = (_a = new web3.Transaction()).add.apply(_a, this.txis);
                        return [4 /*yield*/, this.provider.sendAndConfirm(tx, [activationTokenKp])];
                    case 4:
                        signature = _b.sent();
                        return [2 /*return*/, { Ok: { signature: signature, info: { subscriptionToken: activationToken.toBase58() } } }];
                    case 5:
                        e_1 = _b.sent();
                        log({ error: e_1 });
                        return [2 /*return*/, { Err: e_1 }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Connectivity.prototype._mintSubscriptionToken = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var user, subscriptionToken, receiver, parentProfile, amount, subscriptionTokenState, parentProfileStateInfo, activationTokenStateInfo, receiverAta, profileState, minterProfileAta, ix, tx, signature, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        this.reinit();
                        user = this.provider.publicKey;
                        if (!user)
                            throw "Wallet not found";
                        subscriptionToken = input.subscriptionToken, receiver = input.receiver, parentProfile = input.profile, amount = input.amount;
                        amount = amount !== null && amount !== void 0 ? amount : 1;
                        subscriptionTokenState = void 0;
                        if (!!subscriptionToken) return [3 /*break*/, 2];
                        if (!parentProfile)
                            throw "Parent Profile not found";
                        if (typeof parentProfile == 'string')
                            parentProfile = new web3.PublicKey(parentProfile);
                        return [4 /*yield*/, this.program.account.profileState.fetch(this.__getProfileStateAccount(parentProfile))];
                    case 1:
                        parentProfileStateInfo = _b.sent();
                        if (!parentProfileStateInfo.activationToken)
                            throw "Subscription Token not initialised";
                        subscriptionToken = parentProfileStateInfo.activationToken;
                        subscriptionTokenState = this.__getActivationTokenStateAccount(subscriptionToken);
                        return [3 /*break*/, 4];
                    case 2:
                        if (typeof subscriptionToken == 'string')
                            subscriptionToken = new web3.PublicKey(subscriptionToken);
                        subscriptionTokenState = this.__getActivationTokenStateAccount(subscriptionToken);
                        return [4 /*yield*/, this.program.account.activationTokenState.fetch(subscriptionTokenState)];
                    case 3:
                        activationTokenStateInfo = _b.sent();
                        parentProfile = activationTokenStateInfo.parentProfile;
                        _b.label = 4;
                    case 4:
                        if (!receiver)
                            receiver = user;
                        if (typeof receiver == 'string')
                            receiver = new web3.PublicKey(receiver);
                        return [4 /*yield*/, this.baseSpl.__getOrCreateTokenAccountInstruction({ mint: subscriptionToken, owner: receiver }, this.ixCallBack)
                            // const profile = activationTokenStateInfo.parentProfile
                        ];
                    case 5:
                        receiverAta = (_b.sent()).ata;
                        profileState = this.__getProfileStateAccount(parentProfile);
                        return [4 /*yield*/, this.baseSpl.__getOrCreateTokenAccountInstruction({ mint: parentProfile, owner: user }, this.ixCallBack)];
                    case 6:
                        minterProfileAta = (_b.sent()).ata;
                        return [4 /*yield*/, this.program.methods.mintActivationToken(new BN(amount)).accounts({
                                activationTokenState: subscriptionTokenState,
                                tokenProgram: tokenProgram,
                                activationToken: subscriptionToken,
                                profile: parentProfile,
                                profileState: profileState,
                                minterProfileAta: minterProfileAta,
                                mainState: this.mainState,
                                minter: user,
                                receiverAta: receiverAta,
                            }).instruction()];
                    case 7:
                        ix = _b.sent();
                        this.txis.push(ix);
                        tx = (_a = new web3.Transaction()).add.apply(_a, this.txis);
                        this.txis = [];
                        return [4 /*yield*/, this.provider.sendAndConfirm(tx)];
                    case 8:
                        signature = _b.sent();
                        return [2 /*return*/, { Ok: { signature: signature, info: { subscriptionToken: subscriptionToken.toBase58() } } }];
                    case 9:
                        error_3 = _b.sent();
                        log({ error: error_3 });
                        return [2 /*return*/, { Err: error_3 }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Connectivity.prototype.mintSubscriptionBadge = function (input, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var profile, subscriptionToken, receiver, amount, profileStateAccount, profileStateInfo, res, image, profileMetadata, profileName, username, name_3, symbol, description, external_url, ipfsHash, uri, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        profile = input.profile, subscriptionToken = input.subscriptionToken, receiver = input.receiver, amount = input.amount;
                        if (!subscriptionToken) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._mintSubscriptionToken(input)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        if (!profile)
                            throw "Profile Id not provided";
                        if (typeof profile == 'string')
                            profile = new web3.PublicKey(profile);
                        profileStateAccount = this.__getProfileStateAccount(profile);
                        return [4 /*yield*/, this.program.account.profileState.fetch(profileStateAccount)];
                    case 3:
                        profileStateInfo = _a.sent();
                        if (!profileStateInfo.activationToken) return [3 /*break*/, 5];
                        log({ activationToken: profileStateInfo.activationToken.toBase58() });
                        return [4 /*yield*/, this._mintSubscriptionToken(input)];
                    case 4:
                        res = _a.sent();
                        return [2 /*return*/, res];
                    case 5:
                        // if (!metadata) throw "Subscription token metadata not found"
                        if (!metadata)
                            metadata = { image: "" };
                        image = metadata.image;
                        image = image !== null && image !== void 0 ? image : "";
                        return [4 /*yield*/, this.metaplex.nfts().findByMint({ mintAddress: profile })];
                    case 6:
                        profileMetadata = _a.sent();
                        profileName = profileMetadata.name;
                        username = profileMetadata.symbol;
                        name_3 = "Subscribe to ".concat(username);
                        symbol = "".concat(username, "SUB");
                        description = "".concat(username, " invites you to subscribe to their feed on OPOS DAO");
                        external_url = "https://oposdao.com/".concat(username);
                        return [4 /*yield*/, deployJsonData({
                                "name": name_3,
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
                            })];
                    case 7:
                        ipfsHash = _a.sent();
                        if (!ipfsHash) {
                            // alert("Failed to upload metadata")
                            throw "Failed to upload metadata";
                        }
                        uri = "https://gateway.pinata.cloud/ipfs/".concat(ipfsHash);
                        return [4 /*yield*/, this._initSubscriptionBadge({
                                profile: profile,
                                name: name_3,
                                symbol: symbol,
                                uri: uri,
                                amount: amount
                            })];
                    case 8:
                        res = _a.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    Connectivity.prototype.mintOffer = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var user, profile, name_4, symbol, image, description, profileMetadataInfo, profileName, username, ipfsHash, uri, profileState, profileMetadata, profileEdition, profileCollectionAuthorityRecord, userProfileAta, mintKp, offer, offerMetadata, offerEdition, userOfferAta, mintIxs, ix, tx, signature, e_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        user = this.provider.publicKey;
                        this.reinit();
                        profile = input.profile, name_4 = input.name, symbol = input.symbol, image = input.image, description = input.description;
                        if (typeof profile == 'string')
                            profile = new web3.PublicKey(profile);
                        symbol = symbol !== null && symbol !== void 0 ? symbol : "";
                        image = image !== null && image !== void 0 ? image : "";
                        description = description !== null && description !== void 0 ? description : "";
                        return [4 /*yield*/, this.metaplex.nfts().findByMint({ mintAddress: profile })];
                    case 1:
                        profileMetadataInfo = _c.sent();
                        profileName = profileMetadataInfo.name;
                        username = profileMetadataInfo.symbol;
                        return [4 /*yield*/, deployJsonData({
                                "name": name_4,
                                "symbol": symbol,
                                "description": description,
                                "image": image,
                                "external_url": "https://oposdao.com/profile/".concat(symbol),
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
                            })];
                    case 2:
                        ipfsHash = _c.sent();
                        if (!ipfsHash) {
                            // alert("Failed to upload metadata")
                            throw "Failed to upload metadata";
                        }
                        uri = "https://gateway.pinata.cloud/ipfs/".concat(ipfsHash);
                        profileState = this.__getProfileStateAccount(profile);
                        profileMetadata = BaseMpl.getMetadataAccount(profile);
                        profileEdition = BaseMpl.getEditionAccount(profile);
                        profileCollectionAuthorityRecord = BaseMpl.getCollectionAuthorityRecordAccount(profile, this.mainState);
                        return [4 /*yield*/, this.baseSpl.__getOrCreateTokenAccountInstruction({ mint: profile, owner: user }, this.ixCallBack)];
                    case 3:
                        userProfileAta = (_c.sent()).ata;
                        mintKp = web3.Keypair.generate();
                        offer = mintKp.publicKey;
                        offerMetadata = BaseMpl.getMetadataAccount(offer);
                        offerEdition = BaseMpl.getEditionAccount(offer);
                        userOfferAta = getAssociatedTokenAddressSync(offer, user);
                        return [4 /*yield*/, this.baseSpl.__getCreateTokenInstructions({
                                mintAuthority: user,
                                mintKeypair: mintKp,
                                mintingInfo: {
                                    tokenAmount: 1,
                                }
                            })];
                    case 4:
                        mintIxs = (_c.sent()).ixs;
                        (_a = this.txis).push.apply(_a, mintIxs);
                        return [4 /*yield*/, this.program.methods.mintOffer(name_4, symbol, uri).accounts({
                                profile: profile,
                                mainState: this.mainState,
                                user: user,
                                associatedTokenProgram: associatedTokenProgram,
                                mplProgram: mplProgram,
                                profileState: profileState,
                                tokenProgram: tokenProgram,
                                systemProgram: systemProgram,
                                profileEdition: profileEdition,
                                userProfileAta: userProfileAta,
                                offer: offer,
                                offerEdition: offerEdition,
                                profileMetadata: profileMetadata,
                                sysvarInstructions: sysvarInstructions,
                                userOfferAta: userOfferAta,
                                offerMetadata: offerMetadata,
                            }).instruction()];
                    case 5:
                        ix = _c.sent();
                        this.txis.push(ix);
                        tx = (_b = new web3.Transaction()).add.apply(_b, this.txis);
                        return [4 /*yield*/, this.provider.sendAndConfirm(tx, [mintKp])];
                    case 6:
                        signature = _c.sent();
                        return [2 /*return*/, { Ok: { signature: signature, info: { offer: offer.toBase58() } } }];
                    case 7:
                        e_2 = _c.sent();
                        log({ error: e_2 });
                        return [2 /*return*/, { Err: e_2 }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Connectivity.prototype.__getProfileHoldersInfo = function (input, parentProfile, genesisProfile) {
        return __awaiter(this, void 0, void 0, function () {
            var grandParentProfile, greatGrandParentProfile, ggreateGrandParentProfile, currentParentProfileHolderAta, currentGrandParentProfileHolderAta, currentGreatGrandParentProfileHolderAta, currentGgreatGrandParentProfileHolderAta, currentGenesisProfileHolderAta, atasInfo, currentParentProfileHolder, currentGrandParentProfileHolder, currentGreatGrandParentProfileHolder, currentGgreatGrandParentProfileHolder, currentGenesisProfileHolder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        grandParentProfile = input.parent;
                        greatGrandParentProfile = input.grandParent;
                        ggreateGrandParentProfile = input.greatGrandParent;
                        return [4 /*yield*/, this.connection.getTokenLargestAccounts(parentProfile)];
                    case 1:
                        currentParentProfileHolderAta = (_a.sent()).value[0].address;
                        return [4 /*yield*/, this.connection.getTokenLargestAccounts(grandParentProfile)];
                    case 2:
                        currentGrandParentProfileHolderAta = (_a.sent()).value[0].address;
                        return [4 /*yield*/, this.connection.getTokenLargestAccounts(greatGrandParentProfile)];
                    case 3:
                        currentGreatGrandParentProfileHolderAta = (_a.sent()).value[0].address;
                        return [4 /*yield*/, this.connection.getTokenLargestAccounts(ggreateGrandParentProfile)];
                    case 4:
                        currentGgreatGrandParentProfileHolderAta = (_a.sent()).value[0].address;
                        return [4 /*yield*/, this.connection.getTokenLargestAccounts(genesisProfile)];
                    case 5:
                        currentGenesisProfileHolderAta = (_a.sent()).value[0].address;
                        return [4 /*yield*/, this.connection.getMultipleAccountsInfo([
                                currentParentProfileHolderAta,
                                currentGrandParentProfileHolderAta,
                                currentGreatGrandParentProfileHolderAta,
                                currentGgreatGrandParentProfileHolderAta,
                                currentGenesisProfileHolderAta
                            ])];
                    case 6:
                        atasInfo = _a.sent();
                        currentParentProfileHolder = unpackAccount(currentParentProfileHolderAta, atasInfo[0]).owner;
                        currentGrandParentProfileHolder = unpackAccount(currentGrandParentProfileHolderAta, atasInfo[1]).owner;
                        currentGreatGrandParentProfileHolder = unpackAccount(currentGreatGrandParentProfileHolderAta, atasInfo[2]).owner;
                        currentGgreatGrandParentProfileHolder = unpackAccount(currentGgreatGrandParentProfileHolderAta, atasInfo[3]).owner;
                        currentGenesisProfileHolder = unpackAccount(currentGenesisProfileHolderAta, atasInfo[4]).owner;
                        return [2 /*return*/, {
                                //profiles:
                                parentProfile: parentProfile,
                                grandParentProfile: grandParentProfile,
                                greatGrandParentProfile: greatGrandParentProfile,
                                ggreateGrandParentProfile: ggreateGrandParentProfile,
                                genesisProfile: genesisProfile,
                                // profile holder profile ata
                                currentParentProfileHolderAta: currentParentProfileHolderAta,
                                currentGrandParentProfileHolderAta: currentGrandParentProfileHolderAta,
                                currentGreatGrandParentProfileHolderAta: currentGreatGrandParentProfileHolderAta,
                                currentGgreatGrandParentProfileHolderAta: currentGgreatGrandParentProfileHolderAta,
                                currentGenesisProfileHolderAta: currentGenesisProfileHolderAta,
                                // profile holders
                                currentParentProfileHolder: currentParentProfileHolder,
                                currentGrandParentProfileHolder: currentGrandParentProfileHolder,
                                currentGreatGrandParentProfileHolder: currentGreatGrandParentProfileHolder,
                                currentGgreatGrandParentProfileHolder: currentGgreatGrandParentProfileHolder,
                                currentGenesisProfileHolder: currentGenesisProfileHolder,
                                // profile holder oposAta
                                parentProfileHolderOposAta: getAssociatedTokenAddressSync(oposToken, currentParentProfileHolder),
                                grandParentProfileHolderOposAta: getAssociatedTokenAddressSync(oposToken, currentGrandParentProfileHolder),
                                greatGrandParentProfileHolderOposAta: getAssociatedTokenAddressSync(oposToken, currentGreatGrandParentProfileHolder),
                                ggreatGrandParentProfileHolderOposAta: getAssociatedTokenAddressSync(oposToken, currentGgreatGrandParentProfileHolder),
                                genesisProfileHolderOposAta: getAssociatedTokenAddressSync(oposToken, currentGenesisProfileHolder),
                            }];
                }
            });
        });
    };
    Connectivity.prototype.__getMetadata = function (mint) {
        return __awaiter(this, void 0, void 0, function () {
            var cache, metadataAccount, info, metadata;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof mint == 'string')
                            mint = new web3.PublicKey(mint);
                        cache = this.cacheMeta.get(mint.toBase58());
                        if (cache)
                            return [2 /*return*/, cache];
                        metadataAccount = BaseMpl.getMetadataAccount(mint);
                        return [4 /*yield*/, this.connection.getAccountInfo(metadataAccount)];
                    case 1:
                        info = _a.sent();
                        if (!info)
                            throw "Metadata Not found";
                        metadata = Metadata.fromAccountInfo(info)[0];
                        this.cacheMeta.set(mint.toBase58(), metadata);
                        return [2 /*return*/, metadata];
                }
            });
        });
    };
    // Data fetch utils
    Connectivity.prototype.getUserInfo = function (input) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var user, activationTokenId, genesisProfileId, profileCollectionId, profileCollection, genesisProfile, activationToken, userActivationTokenAta, userOposAta, infoes, solBalance, oposTokenBalance, activationTokenBalance, tokenAccount, tokenAccount, response, tokens, _i, response_1, _g, account, pubkey, tk, metadataAccounts, metadataAccountsInfo, profiles, sfts, offers, _h, metadataAccountsInfo_1, account, metadata, collectionInfo, creators, first, second, tokenStandard;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        user = this.provider.publicKey;
                        if (!user)
                            throw "Wallet not found";
                        activationTokenId = input.activationTokenId, genesisProfileId = input.genesisProfileId, profileCollectionId = input.profileCollectionId;
                        profileCollection = new web3.PublicKey(profileCollectionId);
                        genesisProfile = new web3.PublicKey(genesisProfileId);
                        activationToken = new web3.PublicKey(activationTokenId);
                        userActivationTokenAta = getAssociatedTokenAddressSync(activationToken, user);
                        userOposAta = getAssociatedTokenAddressSync(oposToken, user);
                        return [4 /*yield*/, this.connection.getMultipleAccountsInfo([user, userOposAta, getAssociatedTokenAddressSync(activationToken, user)])];
                    case 1:
                        infoes = _j.sent();
                        solBalance = (_b = (_a = infoes[0]) === null || _a === void 0 ? void 0 : _a.lamports) !== null && _b !== void 0 ? _b : 0 / 1000000000;
                        oposTokenBalance = 0;
                        activationTokenBalance = 0;
                        if (infoes[1]) {
                            tokenAccount = unpackAccount(userOposAta, infoes[1]);
                            oposTokenBalance = ((_d = parseInt((_c = tokenAccount === null || tokenAccount === void 0 ? void 0 : tokenAccount.amount) === null || _c === void 0 ? void 0 : _c.toString())) !== null && _d !== void 0 ? _d : 0) / LAMPORTS_PER_OPOS;
                        }
                        if (infoes[2]) {
                            tokenAccount = unpackAccount(userActivationTokenAta, infoes[2]);
                            activationTokenBalance = parseInt((_e = tokenAccount === null || tokenAccount === void 0 ? void 0 : tokenAccount.amount) === null || _e === void 0 ? void 0 : _e.toString());
                        }
                        return [4 /*yield*/, this.connection.getTokenAccountsByOwner(user, {
                                programId: TOKEN_PROGRAM_ID,
                            })];
                    case 2:
                        response = (_j.sent()).value;
                        tokens = [];
                        for (_i = 0, response_1 = response; _i < response_1.length; _i++) {
                            _g = response_1[_i], account = _g.account, pubkey = _g.pubkey;
                            tk = unpackAccount(pubkey, account);
                            if (tk.amount > 0)
                                tokens.push(tk.mint);
                        }
                        metadataAccounts = tokens.map(function (e) { return BaseMpl.getMetadataAccount(e); });
                        return [4 /*yield*/, this.connection.getMultipleAccountsInfo(metadataAccounts)];
                    case 3:
                        metadataAccountsInfo = _j.sent();
                        profiles = [];
                        sfts = new Map();
                        offers = new Map();
                        for (_h = 0, metadataAccountsInfo_1 = metadataAccountsInfo; _h < metadataAccountsInfo_1.length; _h++) {
                            account = metadataAccountsInfo_1[_h];
                            try {
                                if (!account)
                                    continue;
                                metadata = Metadata.fromAccountInfo(account)[0];
                                if (!metadata)
                                    continue;
                                collectionInfo = metadata === null || metadata === void 0 ? void 0 : metadata.collection;
                                if (!collectionInfo)
                                    continue;
                                if (((_f = collectionInfo === null || collectionInfo === void 0 ? void 0 : collectionInfo.key) === null || _f === void 0 ? void 0 : _f.toBase58()) == profileCollection.toBase58()) {
                                    profiles.push(metadata);
                                }
                                else {
                                    if (metadata.mint.toBase58() == input.activationTokenId)
                                        continue;
                                    creators = metadata.data.creators;
                                    if (!creators || creators.length == 0)
                                        continue;
                                    first = creators[0];
                                    second = creators[1];
                                    if (!second)
                                        continue;
                                    if (first.verified && first.address.toBase58() == this.mainState.toBase58()) {
                                        tokenStandard = metadata.tokenStandard;
                                        if (tokenStandard == TokenStandard.NonFungible)
                                            offers.set(metadata.mint.toBase58(), { profileId: second.address.toBase58(), offerMeta: metadata });
                                        else
                                            sfts.set(metadata.mint.toBase58(), { profileId: second.address.toBase58(), sftMeta: metadata });
                                    }
                                }
                            }
                            catch (_k) { }
                        }
                        //TODO: set sft's profile data of
                        return [2 /*return*/, {
                                solBalance: solBalance,
                                oposTokenBalance: oposTokenBalance,
                                activationTokenBalance: activationTokenBalance,
                                profiles: profiles,
                                sfts: sfts,
                                offers: offers
                            }];
                }
            });
        });
    };
    Connectivity.prototype.getCommonInfo = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var mainStateInfo, profileCollection, profileCollectionState, genesisProfile, genesisProfileInfo, activationTokenId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.program.account.mainState.fetch(this.mainState)];
                    case 1:
                        mainStateInfo = _b.sent();
                        profileCollection = mainStateInfo.profileCollection;
                        return [4 /*yield*/, this.program.account.collectionState.fetch(this.__getCollectionStateAccount(profileCollection))];
                    case 2:
                        profileCollectionState = _b.sent();
                        genesisProfile = profileCollectionState.genesisProfile;
                        return [4 /*yield*/, this.program.account.profileState.fetch(this.__getProfileStateAccount(genesisProfile))];
                    case 3:
                        genesisProfileInfo = _b.sent();
                        activationTokenId = genesisProfileInfo.activationToken;
                        return [2 /*return*/, {
                                oposTokenId: oposToken.toBase58(),
                                profileCollectionId: profileCollection.toBase58(),
                                genesisProfileId: genesisProfile.toBase58(),
                                activationTokenId: (_a = activationTokenId === null || activationTokenId === void 0 ? void 0 : activationTokenId.toBase58()) !== null && _a !== void 0 ? _a : "",
                                commonLut: mainStateInfo.commonLut.toBase58(),
                                profileMintingCost: parseInt(mainStateInfo.profileMintingCost.toString())
                            }];
                }
            });
        });
    };
    Connectivity.prototype.getLineageInfoByProfile = function (profile) {
        return __awaiter(this, void 0, void 0, function () {
            var profileInfo, parsedInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof profile == 'string')
                            profile = new web3.PublicKey(profile);
                        return [4 /*yield*/, this.program.account.profileState.fetch(this.__getProfileStateAccount(profile))];
                    case 1:
                        profileInfo = _a.sent();
                        parsedInfo = JSON.parse(JSON.stringify(profileInfo.lineage));
                        parsedInfo.generation = parseInt("0x" + (parsedInfo === null || parsedInfo === void 0 ? void 0 : parsedInfo.generation));
                        parsedInfo.totalChild = parseInt("0x" + (parsedInfo === null || parsedInfo === void 0 ? void 0 : parsedInfo.totalChild));
                        return [2 /*return*/, parsedInfo];
                }
            });
        });
    };
    Connectivity.prototype.getLineageInfoBySft = function (activationToken) {
        return __awaiter(this, void 0, void 0, function () {
            var activationTokenInfo, profile;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (typeof activationToken == 'string')
                            activationToken = new web3.PublicKey(activationToken);
                        return [4 /*yield*/, this.program.account.activationTokenState.fetch(this.__getActivationTokenStateAccount(activationToken))];
                    case 1:
                        activationTokenInfo = _b.sent();
                        profile = activationTokenInfo.parentProfile;
                        _a = {
                            profile: profile.toBase58()
                        };
                        return [4 /*yield*/, this.getLineageInfoByProfile(profile)];
                    case 2: return [2 /*return*/, (_a.lineage = _b.sent(),
                            _a)];
                }
            });
        });
    };
    Connectivity.prototype.getProfileInfo = function (profileId) {
        return __awaiter(this, void 0, void 0, function () {
            var profileInfo, parentProfile, grandParentProfile, greatGrandParentProfile, ggreatGrandParentProfile, generation, seniority, totalChild, accountInfoes, profileMetadata, parentProfileMetadata, grandParentProfileMetadata, greateGrandParentProfileMetadata, ggreateGrandParentProfileMetadata, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (typeof profileId == 'string')
                            profileId = new web3.PublicKey(profileId);
                        return [4 /*yield*/, this.program.account.profileState.fetch(this.__getProfileStateAccount(profileId))];
                    case 1:
                        profileInfo = _a.sent();
                        parentProfile = profileInfo.lineage.parent;
                        grandParentProfile = profileInfo.lineage.grandParent;
                        greatGrandParentProfile = profileInfo.lineage.greatGrandParent;
                        ggreatGrandParentProfile = profileInfo.lineage.ggreatGrandParent;
                        generation = parseInt("0x" + profileInfo.lineage.generation.toString());
                        seniority = generation;
                        totalChild = parseInt("0x" + profileInfo.lineage.totalChild.toString());
                        return [4 /*yield*/, this.connection.getMultipleAccountsInfo([
                                BaseMpl.getMetadataAccount(profileId),
                                BaseMpl.getMetadataAccount(parentProfile),
                                BaseMpl.getMetadataAccount(grandParentProfile),
                                BaseMpl.getMetadataAccount(greatGrandParentProfile),
                                BaseMpl.getMetadataAccount(ggreatGrandParentProfile),
                            ])];
                    case 2:
                        accountInfoes = _a.sent();
                        profileMetadata = Metadata.fromAccountInfo(accountInfoes[0])[0];
                        parentProfileMetadata = Metadata.fromAccountInfo(accountInfoes[1])[0];
                        grandParentProfileMetadata = Metadata.fromAccountInfo(accountInfoes[2])[0];
                        greateGrandParentProfileMetadata = Metadata.fromAccountInfo(accountInfoes[3])[0];
                        ggreateGrandParentProfileMetadata = Metadata.fromAccountInfo(accountInfoes[4])[0];
                        return [2 /*return*/, {
                                profileName: profileMetadata.data.name.split('\0')[0],
                                userName: profileMetadata.data.symbol.split('\0')[0],
                                profileMint: profileId.toBase58(),
                                seniority: seniority,
                                generation: generation,
                                totalChild: totalChild,
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
                            }];
                    case 3:
                        error_4 = _a.sent();
                        log({ error: error_4 });
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Connectivity;
}());
export { Connectivity };
