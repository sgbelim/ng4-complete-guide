import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError} from "rxjs/operators";
import {BehaviorSubject, tap, throwError} from "rxjs";
import {User} from "./user.model";
import {Router} from "@angular/router";
import {environment} from "../../environments/environment";

export interface AuthResponseData {
  idToken: string,
  email: string,
  refreshToken: string,
  expiresIn: string,
  localId: string,
  registered?: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user = new BehaviorSubject<User>(null);
  private signupUrl: string = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.fireBaseApiKey}`
  private signInUrl: string = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.fireBaseApiKey}`
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) {
  }

  public login(email: string, password: string) {

    const payload = {
      email: email,
      password: password,
      returnSecureToken: true
    };

    return this.http
      .post<AuthResponseData>(this.signInUrl, payload)
      .pipe(
        catchError(this.handleError),
        tap(responseData => {
          this.handleAuthentication(responseData.email, responseData.localId, responseData.idToken, +responseData.expiresIn)
        }));
  }

  public signUp(email: string, password: string) {

    const payload = {
      email: email,
      password: password,
      returnSecureToken: true
    };

    return this.http
      .post<AuthResponseData>(this.signupUrl, payload)
      .pipe(
        catchError(this.handleError),
        tap(responseData => {
          this.handleAuthentication(responseData.email, responseData.localId, responseData.idToken, +responseData.expiresIn)
        })
      );
  }

  public logout() {
    this.user.next(null);
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

      this.user.next(loadedUser);
    }

  }

  public autoLogout(expirationDuration: number) {

    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration)

  }

  private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {

    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000)
    const user = new User(email, userId, token, expirationDate);

    this.user.next(user);
    this.autoLogout(expiresIn * 1000);

    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errorResponse: HttpErrorResponse) {

    let errorMessage = 'An unknown error occurred';

    if (!errorResponse.error || !errorResponse.error.error) {
      return throwError(errorMessage);
    }

    switch (errorResponse.error.error.message) {
      case "EMAIL_EXISTS":
        errorMessage = 'This email already exists';
        break;
      case "EMAIL_NOT_FOUND":
        errorMessage = 'This email does not exists'
        break;
      case "INVALID_PASSWORD":
        errorMessage = 'This password is not correct'
        break;
    }

    return throwError(errorMessage);
  }
}
