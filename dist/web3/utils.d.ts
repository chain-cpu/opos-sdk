import { ProfileState } from './web3Types';
export declare function calcNonDecimalValue(value: number, decimals: number): number;
export declare function parseProfileState(state: ProfileState): {
    profileMint: string;
    lineage: {
        creator: string;
        parent: string;
        grandParent: string;
        greatGrandParent: string;
        unclePsy: string;
        generation: number;
        totalChild: number;
    };
    activationToken: string | undefined;
};
export declare function deployJsonData(data: any): Promise<any>;
