import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SurveyService, Survey, Question, QuestionOption } from '../../core/services/survey.service';

@Component({
  selector: 'app-survey-create',
  templateUrl: './survey-create.component.html',
  styleUrls: ['./survey-create.component.scss']
})
export class SurveyCreateComponent implements OnInit {
  surveyForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    // Debug: Monitor form validity changes
    this.surveyForm.statusChanges.subscribe(status => {
      console.log('📝 Form status:', status);
      console.log('📝 Form valid:', this.surveyForm.valid);
      console.log('📝 Form errors:', this.getFormValidationErrors());
    });
  }

  initializeForm(): void {
    this.surveyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      allowMultipleResponses: [false],
      questions: this.fb.array([])
    });

    // Add initial question
    this.addQuestion();
  }

  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  createQuestionForm(): FormGroup {
    return this.fb.group({
      text: ['', [Validators.required, Validators.minLength(5)]],
      type: ['single', Validators.required],
      isRequired: [true],
      options: this.fb.array([
        this.fb.group({
          text: ['', Validators.required],
          order: [0]
        }),
        this.fb.group({
          text: ['', Validators.required],
          order: [1]
        })
      ])
    });
  }

  addQuestion(): void {
    this.questions.push(this.createQuestionForm());
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  getQuestionOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number): void {
    const options = this.getQuestionOptions(questionIndex);
    const newOrder = options.length;
    options.push(this.fb.group({
      text: ['', Validators.required],
      order: [newOrder]
    }));
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.getQuestionOptions(questionIndex);
    if (options.length > 2) {
      options.removeAt(optionIndex);
      // Reorder remaining options
      options.controls.forEach((control, index) => {
        control.get('order')?.setValue(index);
      });
    }
  }

  onQuestionTypeChange(questionIndex: number): void {
    const question = this.questions.at(questionIndex);
    const type = question.get('type')?.value;
    const options = this.getQuestionOptions(questionIndex);

    if (type === 'open') {
      // Clear options for open questions
      while (options.length > 0) {
        options.removeAt(0);
      }
    } else if (options.length === 0) {
      // Add default options for closed questions
      options.push(this.fb.group({
        text: ['', Validators.required],
        order: [0]
      }));
      options.push(this.fb.group({
        text: ['', Validators.required],
        order: [1]
      }));
    }
  }

  onSubmit(): void {
    if (this.surveyForm.valid) {
      this.isLoading = true;
      
      const formValue = this.surveyForm.value;
      const surveyData: Survey = {
        title: formValue.title,
        description: formValue.description,
        allowMultipleResponses: formValue.allowMultipleResponses,
        questions: formValue.questions.map((q: any, index: number) => {
          const question: Question = {
            text: q.text,
            type: q.type,
            isRequired: q.isRequired,
            order: index
          };

          // Only add options for closed questions
          if (q.type !== 'open' && q.options) {
            question.options = q.options
              .filter((opt: any) => opt.text && opt.text.trim() !== '')
              .map((opt: any, optIndex: number) => ({
                text: opt.text.trim(),
                order: optIndex
              }));
          }

          return question;
        })
      };

      this.surveyService.createSurvey(surveyData).subscribe({
        next: (survey) => {
          this.isLoading = false;
          this.snackBar.open('¡Encuesta creada exitosamente!', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/surveys']);
        },
        error: (error) => {
          this.isLoading = false;
          const message = error.error?.message || 'Error al crear la encuesta. Intenta nuevamente.';
          this.snackBar.open(message, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.markFormGroupTouched(this.surveyForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }

  getErrorMessage(controlName: string, questionIndex?: number, optionIndex?: number): string {
    let control;
    
    if (questionIndex !== undefined && optionIndex !== undefined) {
      control = this.getQuestionOptions(questionIndex).at(optionIndex).get('text');
    } else if (questionIndex !== undefined) {
      control = this.questions.at(questionIndex).get(controlName);
    } else {
      control = this.surveyForm.get(controlName);
    }

    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres requeridos`;
    }
    return '';
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  isQuestionClosed(questionIndex: number): boolean {
    const type = this.questions.at(questionIndex).get('type')?.value;
    return type === 'single' || type === 'multiple';
  }

  // Debug method to identify validation errors
  getFormValidationErrors(): any {
    const errors: any = {};
    
    // Check main form errors
    Object.keys(this.surveyForm.controls).forEach(key => {
      const control = this.surveyForm.get(key);
      if (control && !control.valid && control.errors) {
        errors[key] = control.errors;
      }
    });
    
    // Check questions array errors
    const questionsArray = this.surveyForm.get('questions') as FormArray;
    questionsArray.controls.forEach((questionControl, index) => {
      if (!questionControl.valid && questionControl.errors) {
        errors[`question_${index}`] = questionControl.errors;
      }
      
      // Check individual question fields
      const questionGroup = questionControl as FormGroup;
      Object.keys(questionGroup.controls).forEach(field => {
        const fieldControl = questionGroup.get(field);
        if (fieldControl && !fieldControl.valid && fieldControl.errors) {
          errors[`question_${index}_${field}`] = fieldControl.errors;
        }
      });
    });
    
    return errors;
  }
}
