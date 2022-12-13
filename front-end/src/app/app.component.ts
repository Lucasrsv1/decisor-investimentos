import { Component } from "@angular/core";

import * as dayjs from "dayjs";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	public currentYear: string;

	constructor () {
		this.currentYear = dayjs().format("YYYY");
	}
}
