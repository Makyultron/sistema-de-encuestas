import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  public isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor() {}

  initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || 
                   (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    this.setTheme(isDark);
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkTheme.value);
  }

  setTheme(isDark: boolean): void {
    this.isDarkTheme.next(isDark);
    
    if (isDark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  getCurrentTheme(): boolean {
    return this.isDarkTheme.value;
  }
}
