import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SurveyCreateComponent } from './surveys/survey-create/survey-create.component';
import { SurveyListComponent } from './surveys/survey-list/survey-list.component';
import { SurveyTakeComponent } from './surveys/survey-take/survey-take.component';
import { SurveyResultsComponent } from './surveys/survey-results/survey-results.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  // Public routes (no authentication required)
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'survey/:publicId', component: SurveyTakeComponent }, // Public route for taking surveys using publicId
  
  // Protected routes (authentication required)
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'surveys', component: SurveyListComponent, canActivate: [AuthGuard] },
  { path: 'surveys/create', component: SurveyCreateComponent, canActivate: [AuthGuard] },
  { path: 'surveys/:id/results', component: SurveyResultsComponent, canActivate: [AuthGuard] },
  
  // Fallback
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
