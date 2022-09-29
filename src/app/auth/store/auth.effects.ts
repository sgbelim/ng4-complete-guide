import {Actions, Effect, ofType} from "@ngrx/effects";
import * as AuthActions from './auth.actions';
import * as AuthAction from './auth.actions';
import {map, of, switchMap, tap} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError} from "rxjs/operators";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {User} from "../user.model";
import {AuthService} from "../auth.service";

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
  const user = new User(email, userId, token, expirationDate);
  localStorage.setItem('userData', JSON.stringify(user));

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

  constructor(private actions$: Actions,
              private http: HttpClient,
              private router: Router,
              private authService: AuthService) {
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
          tap(resData => {
            this.authService.setLogoutTimer(+resData.expiresIn * 1000)
          }),
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
          tap(resData => {
            this.authService.setLogoutTimer(+resData.expiresIn * 1000)
          }),
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
  authRedirect = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap(() => {
      this.router.navigate(['/']);
    })
  );

  @Effect({dispatch: false})
  authRedirectLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => {
      this.authService.clearLogoutTimer();
      this.router.navigate(['/auth']);
    })
  );

  @Effect({dispatch: false})
  authLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => {
      localStorage.removeItem('userData');
      this.authService.clearLogoutTimer();
      this.router.navigate(['/auth']);
    })
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {

      if (!localStorage.getItem('userData')) {
        return {type: 'DUMMY'};
      }

      const userData: {
        email: string,
        id: string,
        _token: string,
        _tokenExpirationDate: string
      } = JSON.parse(localStorage.getItem('userData'));

      if (!userData) {
        return {type: 'DUMMY'};
      }

      const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate))

      if (loadedUser.token) {

        const expirationDuration = new Date(userData._tokenExpirationDate).getTime() -
          new Date().getTime();

        this.authService.setLogoutTimer(expirationDuration)

        return new AuthAction.AuthenticateSuccess({
          email: loadedUser.email,
          userId: loadedUser.id,
          token: loadedUser.token,
          expirationDate: new Date(userData._tokenExpirationDate)
        });
      }

      return {type: 'DUMMY'};
    })
  );

}
