import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { SurveyService, Survey } from '../../core/services/survey.service';

@Component({
  selector: 'app-survey-list',
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.scss']
})
export class SurveyListComponent implements OnInit {
  surveys: Survey[] = [];
  isLoading = true;
  
  // Observable for template
  surveys$: Observable<Survey[]> = of([]);

  constructor(
    private surveyService: SurveyService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys(): void {
    this.isLoading = true;
    this.surveyService.getSurveys().subscribe({
      next: (surveys: Survey[]) => {
        this.surveys = surveys;
        this.surveys$ = of(surveys);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading surveys:', error);
        this.snackBar.open('Error al cargar las encuestas', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  createSurvey(): void {
    this.router.navigate(['/surveys/create']);
  }

  editSurvey(survey: Survey): void {
    // Navigate to edit survey (if edit functionality is implemented)
    this.router.navigate(['/surveys/edit', survey.id]);
  }

  viewResults(survey: Survey): void {
    this.router.navigate(['/surveys', survey.id, 'results']);
  }

  toggleSurveyStatus(survey: Survey): void {
    const newStatus = !survey.isActive;
    const action = newStatus ? 'activar' : 'desactivar';
    
    this.surveyService.updateSurvey(survey.id!, { isActive: newStatus }).subscribe({
      next: (updatedSurvey) => {
        survey.isActive = updatedSurvey.isActive;
        this.snackBar.open(`Encuesta ${action}da exitosamente`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        const message = error.error?.message || `Error al ${action} la encuesta`;
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteSurvey(survey: Survey): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la encuesta "${survey.title}"? Esta acción no se puede deshacer.`)) {
      this.surveyService.deleteSurvey(survey.id!).subscribe({
        next: () => {
          this.surveys = this.surveys.filter(s => s.id !== survey.id);
          this.snackBar.open('Encuesta eliminada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          const message = error.error?.message || 'Error al eliminar la encuesta';
          this.snackBar.open(message, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  shareSurvey(survey: Survey): void {
    if (survey.publicId) {
      const url = this.surveyService.getPublicSurveyUrl(survey.publicId);
      
      // Copy to clipboard
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Enlace copiado al portapapeles', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }).catch(() => {
        // Fallback for older browsers
        this.showShareDialog(url);
      });
    }
  }

  private showShareDialog(url: string): void {
    // Simple dialog to show the URL (you could implement a proper dialog component)
    const message = `Enlace para compartir: ${url}`;
    this.snackBar.open(message, 'Cerrar', {
      duration: 10000,
      panelClass: ['info-snackbar']
    });
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

  getStatusColor(isActive: boolean | undefined): string {
    return isActive === true ? 'primary' : 'warn';
  }

  getStatusText(isActive: boolean | undefined): string {
    return isActive === true ? 'Activa' : 'Inactiva';
  }
}
