import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest} from "@angular/common/http";
import {exhaustMap, map, Observable, take} from "rxjs";
import {AuthService} from "./auth.service";
import {Store} from "@ngrx/store";
import * as fromApp from '../store/app.reducers'

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService,
              private store: Store<fromApp.AppState>) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return this.store.select('auth')
      .pipe(
        take(1),
        map(authState => {
          return authState.user
        }),
        exhaustMap(user => {

          if (!user) {
            return next.handle(req);
          }

          const newRequest = req.clone({
            params: new HttpParams().set('auth', user.token)
          });

          return next.handle(newRequest);
        })
      )
  }

}
