import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChartConfiguration, ChartData, ChartType, ChartOptions } from 'chart.js';
import { SurveyService, SurveyResults, Survey, Question } from '../../core/services/survey.service';

@Component({
  selector: 'app-survey-results',
  templateUrl: './survey-results.component.html',
  styleUrls: ['./survey-results.component.scss']
})
export class SurveyResultsComponent implements OnInit {
  surveyResults: SurveyResults | null = null;
  isLoading = true;
  errorMessage = '';
  surveyId!: number;
  
  // Chart configurations
  chartData: { [questionId: number]: ChartData } = {};
  chartType: ChartType = 'doughnut';
  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const dataset = context.dataset;
            const total = (dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.surveyId = +params['id'];
      this.loadSurveyResults();
    });
  }

  loadSurveyResults(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.surveyService.getSurveyResults(this.surveyId).subscribe({
      next: (results) => {
        this.surveyResults = results;
        this.generateChartData();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 404) {
          this.errorMessage = 'Encuesta no encontrada.';
        } else if (error.status === 403) {
          this.errorMessage = 'No tienes permisos para ver los resultados de esta encuesta.';
        } else {
          this.errorMessage = 'Error al cargar los resultados. Intenta nuevamente.';
        }
      }
    });
  }

  private generateChartData(): void {
    if (!this.surveyResults) return;

    this.surveyResults.survey.questions.forEach(question => {
      if (question.id && question.type !== 'open') {
        const stats = this.surveyResults!.statistics[question.id];
        
        if (stats && question.options) {
          this.chartData[question.id] = this.createChartDataForQuestion(question.id, stats);
        }
      }
    });
  }

  private createChartDataForQuestion(questionId: number, stats: any): ChartData {
    const questionStats = stats;
    if (!questionStats) return { labels: [], datasets: [] };

    const labels = Object.keys(questionStats.answers || {});
    const data = Object.values(questionStats.answers || {}) as number[];

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ],
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ]
      }]
    };
  }

  getTotalResponses(): number {
    if (!this.surveyResults?.statistics) return 0;
    const stats = Object.values(this.surveyResults.statistics);
    return stats.length > 0 ? (stats[0] as any).totalResponses || 0 : 0;
  }

  getQuestionById(questionId: number): any {
    return this.surveyResults?.survey?.questions?.find(q => q.id === questionId);
  }

  getResponseRate(questionId: number): number {
    const questionStats = this.surveyResults?.statistics?.[questionId];
    const total = this.getTotalResponses();
    if (!questionStats || total === 0) return 0;
    return (questionStats.totalResponses / total) * 100;
  }

  getChartType(question: Question): ChartType {
    return question.type === 'single' ? 'pie' : 'doughnut';
  }

  exportResults(): void {
    if (!this.surveyResults) return;

    const csvData = this.generateCSVData();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `encuesta-${this.surveyResults.survey?.title || 'resultados'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private generateCSVData(): string {
    if (!this.surveyResults) return '';

    let csv = 'Pregunta,Tipo,Respuesta,Cantidad,Porcentaje\n';
    
    this.surveyResults.survey.questions.forEach(question => {
      if (question.id) {
        const stats = this.surveyResults!.statistics[question.id];
        
        if (question.type === 'open') {
          // For open questions, list all text responses
          if (stats?.textResponses) {
            stats.textResponses.forEach((response: string, index: number) => {
              csv += `"${question.text}","Abierta","${response.replace(/"/g, '""')}",1,\n`;
            });
          }
        } else if (question.options && stats?.options) {
          // For closed questions, show option statistics
          const total = stats.totalResponses || 0;
          
          question.options.forEach(option => {
            const optionStats = stats.options.find((opt: any) => opt.optionId === option.id);
            const count = optionStats?.count || 0;
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
            
            csv += `"${question.text}","${question.type === 'single' ? 'Única' : 'Múltiple'}","${option.text}",${count},${percentage}%\n`;
          });
        }
      }
    });

    return csv;
  }

  exportToCSV(): void {
    if (!this.surveyResults) return;

    const csvContent = this.generateCSVData();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `encuesta_${this.surveyResults.survey.title}_resultados.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.snackBar.open('Resultados exportados exitosamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/surveys']);
  }

  shareSurvey(): void {
    if (this.surveyResults?.survey.publicId) {
      const url = this.surveyService.getPublicSurveyUrl(this.surveyResults.survey.publicId);
      
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Enlace copiado al portapapeles', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }).catch(() => {
        this.snackBar.open(`Enlace: ${url}`, 'Cerrar', {
          duration: 10000,
          panelClass: ['info-snackbar']
        });
      });
    }
  }

  getQuestionTypeText(type: string): string {
    switch (type) {
      case 'open': return 'Pregunta abierta';
      case 'single': return 'Selección única';
      case 'multiple': return 'Selección múltiple';
      default: return type;
    }
  }

  getResponseCountText(count: number): string {
    return count === 1 ? '1 respuesta' : `${count} respuestas`;
  }

  hasChartData(questionId: number): boolean {
    return !!this.chartData[questionId];
  }

  getOpenResponses(questionId: number): string[] {
    if (!this.surveyResults) return [];
    
    const stats = this.surveyResults.statistics[questionId];
    return stats?.textResponses || [];
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
