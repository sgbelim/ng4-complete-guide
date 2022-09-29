import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User} from "./user.model";
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import * as fromApp from '../store/app.reducers';
import * as AuthAction from './store/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenExpirationTimer: any;

  constructor(private http: HttpClient,
              private router: Router,
              private store: Store<fromApp.AppState>) {
  }

  public logout() {
    this.store.dispatch(new AuthAction.Logout());

    localStorage.removeItem('userData');

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.router.navigate(['/auth']);
  }

  public autoLogin() {

    if (!localStorage.getItem('userData')) {
      return;
    }

    const userData: {
      email: string,
      id: string,
      _token: string,
      _tokenExpirationDate: string
    } = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
      return;
    }

    const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate))

    if (loadedUser.token) {

      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime()
      this.autoLogout(expirationDuration);

      this.store.dispatch(new AuthAction.AuthenticateSuccess({
        email: loadedUser.email,
        userId: loadedUser.id,
        token: loadedUser.token,
        expirationDate: new Date(userData._tokenExpirationDate)
      }));

    }
  }

  public autoLogout(expirationDuration: number) {

    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration)

  }
}
