import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService, User } from '../core/services/auth.service';
import { SurveyService, Survey, UserStats } from '../core/services/survey.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  recentSurveys: Survey[] = [];
  isLoading = true;
  stats: UserStats = {
    totalSurveys: 0,
    totalResponses: 0,
    activeSurveys: 0,
    recentSurveys: []
  };

  // Observable properties for template
  currentUser$: Observable<User | null> = of(null);
  recentSurveys$: Observable<Survey[]> = of([]);
  userStats$: Observable<UserStats> = of({
    totalSurveys: 0,
    totalResponses: 0,
    activeSurveys: 0,
    recentSurveys: []
  });

  constructor(
    private authService: AuthService,
    private surveyService: SurveyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.currentUser$ = of(user);
    });
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load user statistics
    this.surveyService.getUserStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.recentSurveys = stats.recentSurveys || [];
        this.isLoading = false;
        this.userStats$ = of(stats);
        this.recentSurveys$ = of(this.recentSurveys);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading dashboard data:', error);
        // Set default values on error
        this.stats = {
          totalSurveys: 0,
          totalResponses: 0,
          activeSurveys: 0,
          recentSurveys: []
        };
        this.userStats$ = of(this.stats);
      }
    });
  }

  createSurvey(): void {
    this.router.navigate(['/surveys/create']);
  }

  viewAllSurveys(): void {
    this.router.navigate(['/surveys']);
  }

  viewSurveys(): void {
    this.router.navigate(['/surveys']);
  }

  viewSurveyResults(surveyId: number): void {
    this.router.navigate(['/surveys', surveyId, 'results']);
  }

  shareSurvey(survey: Survey): void {
    if (survey.publicId) {
      const url = this.surveyService.getPublicSurveyUrl(survey.publicId);
      
      navigator.clipboard.writeText(url).then(() => {
        // You might want to show a success message here
        console.log('Survey URL copied to clipboard');
      }).catch(() => {
        console.error('Failed to copy URL to clipboard');
      });
    }
  }

  getSurveyStatusText(survey: Survey): string {
    return survey.isActive ? 'Activa' : 'Inactiva';
  }

  getSurveyStatusColor(survey: Survey): string {
    return survey.isActive ? 'primary' : 'warn';
  }

  getResponseCountText(survey: Survey): string {
    const count = survey.responseCount || 0;
    return count === 1 ? '1 respuesta' : `${count} respuestas`;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getWelcomeMessage(): string {
    if (this.currentUser?.name) {
      return `¡Bienvenido, ${this.currentUser.name}!`;
    }
    return '¡Bienvenido!';
  }
}
