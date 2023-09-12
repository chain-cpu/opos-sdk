import { web3 } from "@project-serum/anchor";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
// import { Uses } from "@metaplex-foundation/js/node_modules/@metaplex-foundation/mpl-token-metadata";
import { PROGRAM_ID as MPL_ID, } from "@metaplex-foundation/mpl-token-metadata";
import { Metaplex, } from "@metaplex-foundation/js";
var log = console.log;
var BaseMpl = /** @class */ (function () {
    function BaseMpl(wallet, web3Config) {
        var _this = this;
        this.mplIxs = [];
        this.mplSigns = [];
        this.setUpCallBack = function (ixs, signs) {
            var _a, _b;
            if (ixs) {
                (_a = _this.mplIxs).push.apply(_a, ixs);
                log("ixs added to mpl : ", ixs);
            }
            if (signs) {
                log("sings added to mpl : ", signs);
                (_b = _this.mplSigns).push.apply(_b, signs);
            }
        };
        this.connection = new web3.Connection(web3Config.endpoint, { commitment: 'confirmed' });
        this.metaplex = new Metaplex(this.connection);
    }
    BaseMpl.prototype.reinit = function () {
        // const user = this.wallet.publicKey;
        // if (this.metaplex.identity().publicKey.toBase58() != user.toBase58()) {
        //   this.metaplex.identity().setDriver({
        //     publicKey: user,
        //     signMessage: this.wallet.signMessage,
        //     signTransaction: this.wallet.signTransaction,
        //     signAllTransactions: this.wallet.signAllTransactions,
        //   });
        // }
        //
        // this.mplIxs = [];
    };
    BaseMpl.getEditionAccount = function (tokenId) {
        return web3.PublicKey.findProgramAddressSync([
            utf8.encode("metadata"),
            MPL_ID.toBuffer(),
            tokenId.toBuffer(),
            utf8.encode("edition"),
        ], MPL_ID)[0];
    };
    BaseMpl.getMetadataAccount = function (tokenId) {
        return web3.PublicKey.findProgramAddressSync([utf8.encode("metadata"), MPL_ID.toBuffer(), tokenId.toBuffer()], MPL_ID)[0];
    };
    BaseMpl.getCollectionAuthorityRecordAccount = function (collection, authority) {
        return web3.PublicKey.findProgramAddressSync([
            utf8.encode("metadata"),
            MPL_ID.toBuffer(),
            collection.toBuffer(),
            utf8.encode("collection_authority"),
            authority.toBuffer()
        ], MPL_ID)[0];
    };
    return BaseMpl;
}());
export { BaseMpl };
