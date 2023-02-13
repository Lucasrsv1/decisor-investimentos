import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";

import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import jwtDecode from "jwt-decode";

import { AlertsService } from "../alerts/alerts.service";
import { environment } from "src/environments/environment";
import { LocalStorageKey, LocalStorageService } from "../local-storage/local-storage.service";

@Injectable({ providedIn: "root" })
export class AuthenticationService {
	constructor (
		private readonly http: HttpClient,
		private readonly router: Router,
		private readonly alertsService: AlertsService,
		private readonly localStorage: LocalStorageService
	) { }

	public login (email: string, password: string): Observable<{ token: string }> {
		return this.http.post<{ token: string }>(
			`${environment.apiURL}/v1/login`,
			{ email, password }
		).pipe(
			tap(response => {
				this.localStorage.set(LocalStorageKey.TOKEN, response.token);
				this.router.navigate(["home"]);
			}, (error: HttpErrorResponse) => {
				this.alertsService.httpErrorAlert(
					"Falha ao Entrar",
					"Não foi possível fazer login, tente novamente.",
					error
				);
			})
		);
	}

	public signOut (): void {
		this.localStorage.delete(LocalStorageKey.TOKEN);
		this.router.navigate(["login"]);
	}

	public isLoggedIn (): boolean {
		const token = this.localStorage.get(LocalStorageKey.TOKEN);
		const decodedObj = token ? jwtDecode<{ validCredentials?: boolean }>(token) : null;
		return decodedObj ? Boolean(decodedObj.validCredentials) : false;
	}
}
