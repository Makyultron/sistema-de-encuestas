import { Component, OnInit } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Sistema de Encuestas';

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // Initialize theme from localStorage or default to light
    this.themeService.initializeTheme();
  }
}
