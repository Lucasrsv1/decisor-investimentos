import { Injectable } from "@angular/core";

import { NgBlockUI } from "ng-block-ui";
import Swal from "sweetalert2";


@Injectable({ providedIn: "root" })
export class UtilsService {
	constructor () { }

	public getErrorHandler (errorTitle: string = "Erro!", blockUI: NgBlockUI | null = null, specificMessages: any = { }): (err: any) => void {
		return (err: any) => {
			if (blockUI)
				blockUI.stop();

			if (err.error)
				err = err.error;

			Swal.fire({
				icon: "error",
				title: errorTitle,
				text: specificMessages[err.message] || err.message || "Erro não identificado!",
				confirmButtonColor: "#007BFF"
			});
			console.error(err);
		};
	}
}
