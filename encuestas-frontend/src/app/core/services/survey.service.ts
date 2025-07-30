import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface QuestionOption {
  id?: number;
  text: string;
  order?: number;
}

export interface Question {
  id?: number;
  text: string;
  type: 'open' | 'single' | 'multiple';
  options?: QuestionOption[];
  isRequired?: boolean;
  order?: number;
}

export interface Survey {
  id?: number;
  title: string;
  description?: string;
  publicId?: string;
  isActive?: boolean;
  allowMultipleResponses?: boolean;
  questions: Question[];
  responses?: any[];
  createdAt?: Date;
  updatedAt?: Date;
  responseCount?: number;
  creatorId?: number;
}

export interface SurveyAnswer {
  questionId: number;
  textAnswer?: string;
  selectedOptions?: number[];
}

export interface SurveyResponse {
  sessionId?: string;
  answers: SurveyAnswer[];
}

export interface SurveyResults {
  survey: Survey;
  totalResponses: number;
  statistics: { [questionId: number]: any };
}

export interface UserStats {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  recentSurveys: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private apiUrl = `${environment.apiUrl}/surveys`;
  private usersApiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Métodos para creadores (protegidos)
  createSurvey(survey: Survey): Observable<Survey> {
    return this.http.post<Survey>(this.apiUrl, survey);
  }

  getSurveys(): Observable<Survey[]> {
    return this.http.get<Survey[]>(this.apiUrl);
  }

  getSurvey(id: number): Observable<Survey> {
    return this.http.get<Survey>(`${this.apiUrl}/${id}`);
  }

  updateSurvey(id: number, survey: Partial<Survey>): Observable<Survey> {
    return this.http.patch<Survey>(`${this.apiUrl}/${id}`, survey);
  }

  deleteSurvey(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSurveyResults(id: number): Observable<SurveyResults> {
    return this.http.get<SurveyResults>(`${this.apiUrl}/${id}/results`);
  }

  // Métodos públicos (sin autenticación)
  getPublicSurvey(publicId: string): Observable<Survey> {
    return this.http.get<Survey>(`${this.apiUrl}/public/${publicId}`);
  }

  submitResponse(publicId: string, response: SurveyResponse): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/public/${publicId}/responses`, response);
  }

  checkDuplicate(publicId: string, sessionId?: string): Observable<boolean> {
    let params = new HttpParams();
    if (sessionId) {
      params = params.set('sessionId', sessionId);
    }
    return this.http.get<boolean>(`${this.apiUrl}/public/${publicId}/check-duplicate`, { params });
  }

  // Estadísticas del usuario
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.usersApiUrl}/stats`);
  }

  // Métodos de utilidad
  generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  getPublicSurveyUrl(publicId: string): string {
    return `${window.location.origin}/survey/${publicId}`;
  }
}
