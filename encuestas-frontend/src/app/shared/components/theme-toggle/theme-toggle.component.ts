import { Component } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent {
  private darkThemeSubject = new BehaviorSubject<boolean>(false);
  isDarkTheme$: Observable<boolean> = this.darkThemeSubject.asObservable();

  constructor() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    this.darkThemeSubject.next(isDark);
    this.applyTheme(isDark);
  }

  toggleTheme(): void {
    const currentTheme = this.darkThemeSubject.value;
    const newTheme = !currentTheme;
    this.darkThemeSubject.next(newTheme);
    this.applyTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean): void {
    const body = document.body;
    if (isDark) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }
}
