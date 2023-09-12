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
import { MINT_SIZE, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, createInitializeMintInstruction, createAssociatedTokenAccountInstruction, createMintToInstruction, } from "@solana/spl-token";
import { web3 } from "@project-serum/anchor";
var log = console.log;
var BaseSpl = /** @class */ (function () {
    function BaseSpl(connection) {
        this.__splIxs = [];
        this.__connection = connection;
        this.__cacheAta = new Set();
    }
    BaseSpl.prototype.__reinit = function () {
        this.__splIxs = [];
        this.__cacheAta = new Set();
    };
    BaseSpl.prototype.__getCreateTokenInstructions = function (opts) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var mintAuthority, mintingInfo, decimal, payer, freezAuthority, mintKeypair, mint, rent, ix1, ix2, tokenReceiver, allowOffCurveOwner, tokenAmount, _b, ata, createTokenAccountIx, ix3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.__reinit();
                        mintAuthority = opts.mintAuthority, mintingInfo = opts.mintingInfo, decimal = opts.decimal, payer = opts.payer, freezAuthority = opts.freezAuthority, mintKeypair = opts.mintKeypair;
                        payer = payer !== null && payer !== void 0 ? payer : mintAuthority;
                        freezAuthority = freezAuthority !== null && freezAuthority !== void 0 ? freezAuthority : mintAuthority;
                        decimal = decimal !== null && decimal !== void 0 ? decimal : 0;
                        mintKeypair = mintKeypair !== null && mintKeypair !== void 0 ? mintKeypair : web3.Keypair.generate();
                        mint = mintKeypair.publicKey;
                        return [4 /*yield*/, this.__connection.getMinimumBalanceForRentExemption(MINT_SIZE)];
                    case 1:
                        rent = _c.sent();
                        ix1 = web3.SystemProgram.createAccount({
                            fromPubkey: payer,
                            lamports: rent,
                            newAccountPubkey: mint,
                            programId: TOKEN_PROGRAM_ID,
                            space: MINT_SIZE,
                        });
                        this.__splIxs.push(ix1);
                        ix2 = createInitializeMintInstruction(mintKeypair.publicKey, decimal, mintAuthority, freezAuthority);
                        this.__splIxs.push(ix2);
                        if (mintingInfo) {
                            tokenReceiver = mintingInfo.tokenReceiver, allowOffCurveOwner = mintingInfo.allowOffCurveOwner, tokenAmount = mintingInfo.tokenAmount;
                            tokenReceiver = (_a = mintingInfo === null || mintingInfo === void 0 ? void 0 : mintingInfo.tokenReceiver) !== null && _a !== void 0 ? _a : opts === null || opts === void 0 ? void 0 : opts.mintAuthority;
                            allowOffCurveOwner = allowOffCurveOwner !== null && allowOffCurveOwner !== void 0 ? allowOffCurveOwner : false;
                            tokenAmount = tokenAmount !== null && tokenAmount !== void 0 ? tokenAmount : 1;
                            _b = this.__getCreateTokenAccountInstruction(mint, tokenReceiver, allowOffCurveOwner, payer), ata = _b.ata, createTokenAccountIx = _b.ix;
                            this.__splIxs.push(createTokenAccountIx);
                            ix3 = createMintToInstruction(mint, ata, mintAuthority, tokenAmount);
                            this.__splIxs.push(ix3);
                        }
                        return [2 /*return*/, {
                                mintKp: mintKeypair,
                                ixs: this.__splIxs,
                            }];
                }
            });
        });
    };
    BaseSpl.prototype.__getCreateTokenAccountInstruction = function (mint, owner, allowOffCurveOwner, payer) {
        if (allowOffCurveOwner === void 0) { allowOffCurveOwner = false; }
        var ata = getAssociatedTokenAddressSync(mint, owner, allowOffCurveOwner);
        var ix = createAssociatedTokenAccountInstruction(payer !== null && payer !== void 0 ? payer : owner, ata, owner, mint);
        return {
            ata: ata,
            ix: ix,
        };
    };
    BaseSpl.prototype.__getOrCreateTokenAccountInstruction = function (input, ixCallBack) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, mint, payer, allowOffCurveOwner, checkCache, ata, ix, info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        owner = input.owner, mint = input.mint, payer = input.payer, allowOffCurveOwner = input.allowOffCurveOwner, checkCache = input.checkCache;
                        allowOffCurveOwner = allowOffCurveOwner !== null && allowOffCurveOwner !== void 0 ? allowOffCurveOwner : false;
                        payer = payer !== null && payer !== void 0 ? payer : owner;
                        ata = getAssociatedTokenAddressSync(mint, owner, allowOffCurveOwner);
                        ix = null;
                        return [4 /*yield*/, this.__connection.getAccountInfo(ata)];
                    case 1:
                        info = _a.sent();
                        if (!info) {
                            ix = createAssociatedTokenAccountInstruction(payer !== null && payer !== void 0 ? payer : owner, ata, owner, mint);
                            if (ixCallBack) {
                                if (checkCache) {
                                    if (!this.__cacheAta.has(ata.toBase58())) {
                                        ixCallBack([ix]);
                                        this.__cacheAta.add(ata.toBase58());
                                    }
                                    else
                                        log("ata init already exist");
                                }
                                else {
                                    ixCallBack([ix]);
                                }
                            }
                        }
                        return [2 /*return*/, {
                                ata: ata,
                                ix: ix,
                            }];
                }
            });
        });
    };
    return BaseSpl;
}());
export { BaseSpl };
