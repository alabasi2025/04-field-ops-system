import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'operations',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/operations/operations-list.component').then(m => m.OperationsListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/operations/operation-form.component').then(m => m.OperationFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/operations/operation-detail.component').then(m => m.OperationDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/operations/operation-form.component').then(m => m.OperationFormComponent)
          }
        ]
      },
      {
        path: 'teams',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/teams/teams-list.component').then(m => m.TeamsListComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/teams/team-detail.component').then(m => m.TeamDetailComponent)
          }
        ]
      },
      {
        path: 'workers',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/workers/workers-list.component').then(m => m.WorkersListComponent)
          },
          {
            path: 'map',
            loadComponent: () => import('./features/workers/workers-map.component').then(m => m.WorkersMapComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/workers/worker-detail.component').then(m => m.WorkerDetailComponent)
          }
        ]
      },
      {
        path: 'work-packages',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/work-packages/work-packages-list.component').then(m => m.WorkPackagesListComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/work-packages/work-package-detail.component').then(m => m.WorkPackageDetailComponent)
          }
        ]
      },
      {
        path: 'readings',
        children: [
          {
            path: 'templates',
            loadComponent: () => import('./features/readings/reading-templates.component').then(m => m.ReadingTemplatesComponent)
          },
          {
            path: 'rounds',
            loadComponent: () => import('./features/readings/reading-rounds.component').then(m => m.ReadingRoundsComponent)
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
