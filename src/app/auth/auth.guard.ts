import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Injectable} from "@angular/core";
import {map, Observable, take} from "rxjs";
import {AuthService} from "./auth.service";

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.user
      .pipe(
        take(1),
        map(user => {
          const isLoggedIn = !!user;

          if (isLoggedIn) {
            return true;
          } else {
            return this.router.createUrlTree(['/auth']);
          }
        }));
  }

}
