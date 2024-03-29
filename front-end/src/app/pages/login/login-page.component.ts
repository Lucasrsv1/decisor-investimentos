import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { BlockUI, NgBlockUI } from "ng-block-ui";

import { finalize } from "rxjs/operators";
import { sha512 } from "js-sha512";

import { AuthenticationService } from "src/app/services/authentication/authentication.service";
import { IValidations } from "src/app/components/visual-validator/visual-validator.component";

@Component({
	selector: "app-login-page",
	templateUrl: "./login-page.component.html",
	styleUrls: ["./login-page.component.scss"]
})
export class LoginPageComponent {
	@BlockUI()
	private blockUI!: NgBlockUI;

	public form: FormGroup;
	public validations: IValidations;

	constructor (
		private readonly formBuilder: FormBuilder,
		private readonly authenticationService: AuthenticationService
	) {
		this.form = this.formBuilder.group({
			email: [null, [Validators.required, Validators.email]],
			password: [null, [Validators.required, Validators.minLength(6)]]
		});

		this.validations = {
			form: this.form,
			fields: {
				email: [{ key: "required" }, { key: "email" }],
				password: [{ key: "required" }]
			}
		};
	}

	public login (): void {
		const password = sha512(this.form.controls.password.value);

		this.blockUI.start();
		this.authenticationService.login(this.form.controls.email.value, password)
			.pipe(finalize(() => this.blockUI.stop()))
			.subscribe();
	}
}
