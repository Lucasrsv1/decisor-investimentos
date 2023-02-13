import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthenticationGuard } from "./guards/authentication/authentication.guard";
import { LoginGuard } from "./guards/login/login.guard";

import { HomeComponent } from "./pages/home/home.component";
import { LoginPageComponent } from "./pages/login/login-page.component";

const routes: Routes = [
	{ path: "login", component: LoginPageComponent, canActivate: [LoginGuard] },
	{ path: "home", component: HomeComponent, canActivate: [AuthenticationGuard] },

	// No match
	{ path: "**", redirectTo: "login" }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
