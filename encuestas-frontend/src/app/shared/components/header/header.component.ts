import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, User } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentUser$: Observable<User | null>;
  isDarkTheme$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
  }

  ngOnInit(): void {}

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
