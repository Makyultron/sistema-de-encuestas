import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SurveyService, Survey, Question, SurveyResponse, SurveyAnswer } from '../../core/services/survey.service';

@Component({
  selector: 'app-survey-take',
  templateUrl: './survey-take.component.html',
  styleUrls: ['./survey-take.component.scss']
})
export class SurveyTakeComponent implements OnInit {
  survey: Survey | null = null;
  surveyForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;
  canRespond = true;
  errorMessage = '';
  publicId!: string;
  sessionId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.publicId = params['publicId'];
      this.sessionId = this.getOrCreateSessionId();
      this.loadSurvey();
    });
  }

  private getOrCreateSessionId(): string {
    const cookieName = `survey_session_${this.publicId}`;
    let sessionId = this.getCookie(cookieName);
    
    if (!sessionId) {
      sessionId = this.surveyService.generateSessionId();
      this.setCookie(cookieName, sessionId, 30); // 30 days
    }
    
    return sessionId;
  }

  private getCookie(name: string): string {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  }

  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  loadSurvey(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // First check if user can respond (duplicate prevention)
    this.surveyService.checkDuplicate(this.publicId, this.sessionId).subscribe({
      next: (hasDuplicate) => {
        if (hasDuplicate) {
          this.canRespond = false;
          this.errorMessage = 'Ya has respondido esta encuesta anteriormente.';
          this.isLoading = false;
          return;
        }
        
        // Load the survey
        this.surveyService.getPublicSurvey(this.publicId).subscribe({
          next: (survey) => {
            this.survey = survey;
            this.buildForm();
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
            if (error.status === 404) {
              this.errorMessage = 'Encuesta no encontrada o no está disponible.';
            } else if (error.status === 403) {
              this.errorMessage = 'Esta encuesta no está activa actualmente.';
            } else {
              this.errorMessage = 'Error al cargar la encuesta. Intenta nuevamente.';
            }
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al verificar el estado de la encuesta.';
      }
    });
  }

  buildForm(): void {
    if (!this.survey) return;

    const formControls: { [key: string]: FormControl | FormArray } = {};

    this.survey.questions.forEach(question => {
      if (question.type === 'open') {
        // Open question - text input
        const validators = question.isRequired ? [Validators.required] : [];
        formControls[`question_${question.id}`] = new FormControl('', validators);
      } else if (question.type === 'single') {
        // Single choice - radio button
        const validators = question.isRequired ? [Validators.required] : [];
        formControls[`question_${question.id}`] = new FormControl('', validators);
      } else if (question.type === 'multiple') {
        // Multiple choice - checkboxes
        const checkboxArray = new FormArray<FormControl<boolean | null>>([]);
        question.options?.forEach(() => {
          checkboxArray.push(new FormControl<boolean | null>(false));
        });
        
        if (question.isRequired) {
          checkboxArray.setValidators([this.atLeastOneCheckboxValidator]);
        }
        
        formControls[`question_${question.id}`] = checkboxArray;
      }
    });

    this.surveyForm = new FormGroup(formControls);
  }

  private atLeastOneCheckboxValidator(formArray: AbstractControl): ValidationErrors | null {
    const array = formArray as FormArray;
    const hasSelection = array.controls.some(control => control.value === true);
    return hasSelection ? null : { required: true };
  }

  onSubmit(): void {
    if (!this.surveyForm.valid || !this.survey) {
      this.markFormGroupTouched(this.surveyForm);
      return;
    }

    this.isSubmitting = true;

    const answers: SurveyAnswer[] = [];

    this.survey.questions.forEach(question => {
      const controlName = `question_${question.id}`;
      const control = this.surveyForm.get(controlName);

      if (control && question.id) {
        if (question.type === 'open') {
          // Open question
          const textAnswer = control.value?.trim();
          if (textAnswer) {
            answers.push({
              questionId: question.id,
              textAnswer: textAnswer
            });
          }
        } else if (question.type === 'single') {
          // Single choice
          const selectedOptionId = control.value;
          if (selectedOptionId) {
            answers.push({
              questionId: question.id,
              selectedOptions: [parseInt(selectedOptionId)]
            });
          }
        } else if (question.type === 'multiple') {
          // Multiple choice
          const selectedOptions: number[] = [];
          const formArray = control as FormArray;
          
          formArray.controls.forEach((checkboxControl, index) => {
            if (checkboxControl.value && question.options?.[index]?.id) {
              selectedOptions.push(question.options[index].id!);
            }
          });

          if (selectedOptions.length > 0) {
            answers.push({
              questionId: question.id,
              selectedOptions: selectedOptions
            });
          }
        }
      }
    });

    const response: SurveyResponse = {
      sessionId: this.sessionId,
      answers: answers
    };

    this.surveyService.submitResponse(this.publicId, response).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('¡Respuesta enviada exitosamente! Gracias por participar.', 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        // Redirect to a thank you page or home
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting = false;
        const message = error.error?.message || 'Error al enviar la respuesta. Intenta nuevamente.';
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          arrayControl.markAsTouched();
        });
      }
    });
  }

  getErrorMessage(questionId: number): string {
    const control = this.surveyForm.get(`question_${questionId}`);
    
    if (control?.hasError('required')) {
      return 'Esta pregunta es obligatoria';
    }
    
    return '';
  }

  isQuestionRequired(question: Question): boolean {
    return question.isRequired || false;
  }

  getQuestionControl(questionId: number): FormControl | FormArray {
    return this.surveyForm.get(`question_${questionId}`) as FormControl | FormArray;
  }

  getCheckboxArray(questionId: number): FormArray {
    return this.surveyForm.get(`question_${questionId}`) as FormArray;
  }
}
