import { BrowserModule } from "@angular/platform-browser";
import localePt from "@angular/common/locales/pt";
import { registerLocaleData } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LOCALE_ID, NgModule } from "@angular/core";

import { AccordionModule } from "ngx-bootstrap/accordion";
import { BlockUIModule } from "ng-block-ui";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { NgSelectModule } from "@ng-select/ng-select";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { CurrencyMaskConfig, NgxCurrencyModule } from "ngx-currency";
import { defineLocale, ptBrLocale } from "ngx-bootstrap/chronos";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { ComponentsModule } from "./components/components.module";

import { HomeComponent } from "./pages/home/home.component";
import { HttpClientModule } from "@angular/common/http";

defineLocale("pt-br", ptBrLocale);
registerLocaleData(localePt);

const currencyMaskConfig: CurrencyMaskConfig = {
	align: "auto",
	allowNegative: false,
	allowZero: true,
	decimal: ",",
	precision: 2,
	prefix: "R$ ",
	suffix: "",
	thousands: ".",
	nullable: true
};

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		NgSelectModule,
		ComponentsModule,
		HttpClientModule,
		SweetAlert2Module.forRoot(),
		BlockUIModule.forRoot(),
		NgxCurrencyModule.forRoot(currencyMaskConfig),
		AccordionModule.forRoot(),
		BrowserAnimationsModule,
		BsDatepickerModule.forRoot()
	],
	providers: [{
		provide: LOCALE_ID,
		useValue: "pt-BR"
	}],
	bootstrap: [AppComponent]
})
export class AppModule { }
