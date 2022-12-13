/* eslint-disable camelcase */

export enum PredictionClasses {
	"R < -1%" = "R < -1%",
	"-1% <= R <= 0%" = "-1% <= R <= 0%",
	"0% < R <= 1%" = "0% < R <= 1%",
	"R > 1%" = "R > 1%"
}

export interface IPredictions {
	r1: number;
	r05: number;
	r_1: number;
	r_05: number;
}

export interface IProbability extends IPredictions {
	prediction: PredictionClasses;
	prizes: {
		invest: number;
		dontInvest: number;
	};
	shouldInvest: boolean;
	ticket: string;
	realResult: {
		precoAbertura: number;
		proximoPreco?: number;
		result?: number;
	};
}

export interface IDecision {
	prizeTable: {
		dontInvest: IPredictions;
		invest: IPredictions;
	};

	probabilities: IProbability[];
}
