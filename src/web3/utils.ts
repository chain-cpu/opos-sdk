import { web3, AnchorProvider } from '@project-serum/anchor'
import { BaseSpl } from './base/baseSpl'
import { web3Consts } from './web3Consts'
import { ProfileState } from './web3Types'

//extra
import Axios from 'axios'

const log = console.log;
const { oposToken: usdcMint } = web3Consts;
export function calcNonDecimalValue(value: number, decimals: number): number {
  return Math.trunc(value * (Math.pow(10, decimals)))
}

//Type parsing
export function parseProfileState(state: ProfileState) {
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
    activationToken: state.activationToken?.toBase58(),
  }
}

export function deployJsonData(data: any) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const pinataApiKey = "30448ea9d4ed819a549d"
  const pinataSecretApiKey = "42c2de59b9044f322a6ad1ed3cfebf049f4519b518c5178d6b6828237e58a847"

  return Axios.post(url,
    data,
    {
      headers: {
        'Content-Type': `application/json`,
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey
      }
    }
  ).then(function(response) {
    // log({ response })
    return response?.data?.IpfsHash;
  }).catch(function(error) {
    log({ jsonUploadErr: error })
    return null
  });
}
