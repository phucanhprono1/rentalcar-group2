import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(public auth: AuthService, public router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['']);
      return false;
    }
    const requiredRoles = route.data['roles'] as Array<string>;
    const userRole = this.auth.getRole();

    if (requiredRoles && !requiredRoles.includes(userRole)) {
      this.router.navigate(['not-found']);
      return false;
    }
    return true;
  }

}
