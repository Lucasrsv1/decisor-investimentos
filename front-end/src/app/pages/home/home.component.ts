import { Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { BlockUI, NgBlockUI } from "ng-block-ui";
import { BsDatepickerConfig, BsLocaleService } from "ngx-bootstrap/datepicker";

import * as dayjs from "dayjs";
import { Subscription } from "rxjs";

import { ISimulation } from "src/app/models/simulation";
import { IValidations } from "src/app/components/visual-validator/visual-validator.component";
import { IDecision, IProbability } from "src/app/models/decision";

import { UtilsService } from "src/app/services/utils/utils.service";
import { DecisionService, IDecisionParams } from "src/app/services/decision/decision.service";

@Component({
	selector: "app-home",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnDestroy {
	@BlockUI()
	private blockUI!: NgBlockUI;

	public amountToInvest?: number;
	public decision?: IDecision;
	public selectedTicket?: IProbability;
	public simulationBalance: number = 0;
	public simulationResults: ISimulation[] = [];

	public form: FormGroup;
	public resultsForm: FormGroup;
	public validations: IValidations;

	public isOpen: boolean[] = [true, true, false, false];
	public bsConfig: Partial<BsDatepickerConfig>;

	private subscriptions: Array<Subscription | undefined> = [];

	constructor (
		private readonly formBuilder: FormBuilder,
		private readonly localeService: BsLocaleService,
		private readonly decisionService: DecisionService,
		private readonly utils: UtilsService
	) {
		let defaultDate = dayjs();
		for (let days = 3; days > 0; days--) {
			defaultDate = defaultDate.subtract(1, "day");
			while ([0, 6].includes(defaultDate.day()))
				defaultDate = defaultDate.subtract(1, "day");
		}

		this.form = this.formBuilder.group({
			date: [defaultDate.startOf("date").toDate(), Validators.required],
			investment: [1000, [Validators.required, Validators.min(1)]],
			riskAversion: [3, Validators.required],
			greed: [1, Validators.required]
		});

		this.resultsForm = this.formBuilder.group({
			ticket: [undefined, Validators.required],
			qtyTickets: [3, Validators.required]
		});

		this.validations = {
			form: this.form,
			fields: {
				timezone: [{ key: "required" }],
				investment: [{ key: "required" }, { key: "min" }],
				riskAversion: [{ key: "required" }],
				greed: [{ key: "required" }]
			}
		};

		this.localeService.use("pt-br");
		this.bsConfig = {
			isAnimated: true,
			containerClass: "theme-dark-blue",
			selectFromOtherMonth: true,
			showWeekNumbers: false,
			adaptivePosition: true
		};

		this.subscriptions.push(
			this.resultsForm.get("ticket")?.valueChanges.subscribe(this.updatePrizesTable.bind(this)),
			this.resultsForm.get("qtyTickets")?.valueChanges.subscribe(this.updateSimulation.bind(this))
		);
	}

	public ngOnDestroy (): void {
		for (const subscription of this.subscriptions) {
			if (subscription)
				subscription.unsubscribe();
		}
	}

	public decide (): void {
		if (this.form.invalid) return;

		this.blockUI.start("Calculando probabilidades e decidindo...");
		const params: IDecisionParams = {
			date: this.form.get("date")?.value,
			investment: this.form.get("investment")?.value,
			riskAversion: this.form.get("riskAversion")?.value,
			greed: this.form.get("greed")?.value
		};

		// Limpa simulação anterior
		this.selectedTicket = undefined;
		this.simulationResults = [];
		this.simulationBalance = 0;

		this.amountToInvest = params.investment;
		this.decisionService.getDecision(params).subscribe(
			(decision: IDecision) => {
				this.blockUI.stop();
				this.decision = decision;
				this.isOpen = [false, false, true, true];
				this.resultsForm.get("ticket")?.setValue(decision.probabilities[0]);
				this.updateSimulation();
			},
			this.utils.getErrorHandler("Erro ao Decidir", this.blockUI)
		);
	}

	public updatePrizesTable (): void {
		const probabilities = this.resultsForm.get("ticket")?.value as IProbability;
		if (!probabilities) return;

		this.selectedTicket = probabilities;
	}

	public updateSimulation (): void {
		const qtyTickets = this.resultsForm.get("qtyTickets")?.value as number;
		if (!this.decision || !this.amountToInvest || ![3, 5, 7, 10].includes(qtyTickets))
			return;

		const tickets = this.decision.probabilities.filter(p => p.shouldInvest).slice(0, qtyTickets);
		const totalPrize = tickets.reduce((s, t) => s + Math.max(0, t.prizes.invest), 0);

		this.simulationResults = [];
		this.simulationBalance = 0;

		for (const t of tickets) {
			const percentual = Math.max(0, t.prizes.invest / totalPrize);
			const value = percentual * this.amountToInvest;
			const balance = !t.realResult.result ? null : (value * t.realResult.result) - value;

			this.simulationBalance += balance || 0;
			this.simulationResults.push({
				ticket: t.ticket,
				percentual: percentual * 100,
				value,
				balance
			});
		}
	}
}
