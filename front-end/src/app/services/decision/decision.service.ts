import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import * as dayjs from "dayjs";
import { Observable } from "rxjs";

import { environment } from "src/environments/environment";
import { IDecision } from "src/app/models/decision";

export interface IDecisionParams {
	date: Date;
	investment: number;
	riskAversion: number;
	greed: number;
}

@Injectable({ providedIn: "root" })
export class DecisionService {
	constructor (private http: HttpClient) { }

	public getDecision (params: IDecisionParams): Observable<IDecision> {
		const date = dayjs(params.date).format("YYYY-MM-DD");
		return this.http.get<IDecision>(
			`${environment.apiURL}/v1/decision/${date}/${params.investment}/${params.riskAversion}/${params.greed}`
		);
	}
}
