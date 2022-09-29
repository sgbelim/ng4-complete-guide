import {Actions, Effect, ofType} from "@ngrx/effects";
import * as AuthActions from './auth.actions';
import {map, of, switchMap, tap} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError} from "rxjs/operators";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";

export interface AuthResponseData {
  idToken: string,
  email: string,
  refreshToken: string,
  expiresIn: string,
  localId: string,
  registered?: string
}

const handleAuthentication = (expiresIn: number, email: string, userId: string, token: string) => {

  const expirationDate = new Date(new Date().getTime() + expiresIn * 1000)

  return new AuthActions.AuthenticateSuccess({
    email: email,
    userId: userId,
    token: token,
    expirationDate: expirationDate
  });
}

const handleError = (errorResponse: HttpErrorResponse) => {
  let errorMessage = 'An unknown error occurred';

  if (!errorResponse.error || !errorResponse.error.error) {
    return of(new AuthActions.AuthenticateFail(errorMessage));
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

  return of(new AuthActions.AuthenticateFail(errorMessage));
}

@Injectable()
export class AuthEffects {

  private signInUrl: string = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.fireBaseApiKey}`
  private signupUrl: string = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.fireBaseApiKey}`

  constructor(private actions$: Actions, private http: HttpClient, private router: Router) {
  }

  @Effect()
  authSignUp = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((authData: AuthActions.SignUpStart) => {

      const payload = {
        email: authData.payload.email,
        password: authData.payload.password,
        returnSecureToken: true
      };

      return this.http
        .post<AuthResponseData>(this.signupUrl, payload)
        .pipe(
          map(resData => {
            return handleAuthentication(
              +resData.expiresIn,
              resData.email,
              resData.localId,
              resData.idToken)
          }),
          catchError(errorResponse => {
            return handleError(errorResponse);
          }),
        )
    })
  )

  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((authData: AuthActions.LoginStart) => {

      const payload = {
        email: authData.payload.email,
        password: authData.payload.password,
        returnSecureToken: true
      };

      return this.http
        .post<AuthResponseData>(this.signInUrl, payload)
        .pipe(
          map(resData => {
            return handleAuthentication(
              +resData.expiresIn,
              resData.email,
              resData.localId,
              resData.idToken)
          }),
          catchError(errorResponse => {
            return handleError(errorResponse);
          }),
        )
    })
  );

  @Effect({dispatch: false})
  authSuccess = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap(() => {
      this.router.navigate(['/']);
    })
  );

}
