import {Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "./auth.service";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {AlertComponent} from "../shared/alert/alert.component";
import {PlaceholderDirective} from "../shared/placeholder/placeholder.directive";
import {Store} from "@ngrx/store";
import * as fromApp from '../store/app.reducers';
import * as AuthAction from './store/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {

  isLoginMode: boolean = true;
  isLoading: boolean = false;
  error: string = '';

  @ViewChild("authForm") private authForm: NgForm;
  @ViewChild(PlaceholderDirective) private alertHost: PlaceholderDirective;

  private closeSub: Subscription;

  constructor(private authService: AuthService,
              private router: Router,
              private cmpFactoryResolver: ComponentFactoryResolver,
              private store: Store<fromApp.AppState>) {
  }

  ngOnInit(): void {

    this.store.select('auth').subscribe(authState => {
      this.isLoading = authState.loading;
      this.error = authState.authError

      if (this.error) {
        this.showErrorAlert(this.error);
      }
    })
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

    this.isLoading = true;

    if (this.isLoginMode) {
      this.store.dispatch(new AuthAction.LoginStart({
        email: email,
        password: password
      }));

    } else {
      this.store.dispatch(new AuthAction.SignUpStart({
        email: email,
        password: password
      }));

    }

    this.authForm.reset();
  }

  onHandleError() {
    this.error = null;
  }

  ngOnDestroy(): void {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }
  }

  private showErrorAlert(errorMessage: string) {
    const alertComponentFactory = this.cmpFactoryResolver.resolveComponentFactory(AlertComponent);

    const hostViewContainerRef = this.alertHost.viewContainerRef;
    hostViewContainerRef.clear();

    const componentRef = hostViewContainerRef.createComponent(alertComponentFactory);
    componentRef.instance.message = errorMessage;

    this.closeSub = componentRef.instance.close.subscribe(() => {
      this.closeSub.unsubscribe();
      hostViewContainerRef.clear();
    });

  }
}
