import { web3Consts } from './web3Consts';
//extra
import Axios from 'axios';
var log = console.log;
var usdcMint = web3Consts.oposToken;
export function calcNonDecimalValue(value, decimals) {
    return Math.trunc(value * (Math.pow(10, decimals)));
}
//Type parsing
export function parseProfileState(state) {
    var _a;
    return {
        profileMint: state.mint.toBase58(),
        lineage: {
            creator: state.lineage.creator.toBase58(),
            parent: state.lineage.parent.toBase58(),
            grandParent: state.lineage.grandParent.toBase58(),
            greatGrandParent: state.lineage.greatGrandParent.toBase58(),
            unclePsy: state.lineage.ggreatGrandParent.toBase58(),
            generation: state.lineage.generation.toNumber(),
            totalChild: state.lineage.totalChild.toNumber(),
        },
        activationToken: (_a = state.activationToken) === null || _a === void 0 ? void 0 : _a.toBase58(),
    };
}
export function deployJsonData(data) {
    var url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    var pinataApiKey = "30448ea9d4ed819a549d";
    var pinataSecretApiKey = "42c2de59b9044f322a6ad1ed3cfebf049f4519b518c5178d6b6828237e58a847";
    return Axios.post(url, data, {
        headers: {
            'Content-Type': "application/json",
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretApiKey
        }
    }).then(function (response) {
        var _a;
        // log({ response })
        return (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.IpfsHash;
    }).catch(function (error) {
        log({ jsonUploadErr: error });
        return null;
    });
}
