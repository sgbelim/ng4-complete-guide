import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthResponseData, AuthService} from "./auth.service";
import {Observable} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  isLoginMode: boolean = true;
  isLoading: boolean = false;
  error: string = '';

  @ViewChild("authForm") private authForm: NgForm;

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit() {

    if (!this.authForm.valid) {
      return;
    }

    const email = this.authForm.value.email;
    const password = this.authForm.value.password;

    let authObs: Observable<AuthResponseData>
    this.isLoading = true;

    if (this.isLoginMode) {
      authObs = this.authService.login(email, password)
    } else {
      authObs = this.authService.signUp(email, password)
    }

    authObs
      .subscribe({
        next: (response) => {
          console.log('login/signup', response);
          this.isLoading = false;
          this.router.navigate(['/recipes']);
        },
        error: (errorMessage) => {
          this.error = errorMessage;
          this.isLoading = false;
        }
      })

    this.authForm.reset();
  }

  onHandleError() {
    this.error = null;
  }
}
