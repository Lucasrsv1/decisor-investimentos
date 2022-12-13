import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { VisualValidatorComponent } from "./visual-validator/visual-validator.component";

@NgModule({
	declarations: [
		VisualValidatorComponent
	],
	imports: [
		BrowserModule,
		RouterModule,
		BrowserAnimationsModule
	],
	exports: [
		VisualValidatorComponent
	]
})
export class ComponentsModule { }
