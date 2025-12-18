import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { DrawerModule } from 'primeng/drawer';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    DrawerModule,
    PanelMenuModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-4">
            <p-button 
              icon="pi pi-bars" 
              [text]="true" 
              (click)="drawerVisible = !drawerVisible"
            />
            <h1 class="text-xl font-bold text-primary-700">نظام العمليات الميدانية</h1>
          </div>
          <div class="flex items-center gap-3">
            <p-button icon="pi pi-bell" [text]="true" />
            <p-avatar icon="pi pi-user" shape="circle" />
          </div>
        </div>
      </header>

      <!-- Drawer (Sidebar) -->
      <p-drawer [(visible)]="drawerVisible" [showCloseIcon]="false" styleClass="w-72">
        <ng-template pTemplate="header">
          <div class="flex items-center gap-2">
            <i class="pi pi-cog text-2xl text-primary-600"></i>
            <span class="font-bold text-lg">القائمة الرئيسية</span>
          </div>
        </ng-template>
        
        <p-panelMenu [model]="menuItems" styleClass="w-full" />
      </p-drawer>

      <!-- Main Content -->
      <main class="p-4">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MainLayoutComponent {
  drawerVisible = false;

  menuItems = [
    {
      label: 'لوحة التحكم',
      icon: 'pi pi-home',
      routerLink: '/dashboard'
    },
    {
      label: 'العمليات الميدانية',
      icon: 'pi pi-briefcase',
      items: [
        { label: 'قائمة العمليات', icon: 'pi pi-list', routerLink: '/operations' },
        { label: 'إنشاء عملية', icon: 'pi pi-plus', routerLink: '/operations/new' },
      ]
    },
    {
      label: 'الفرق والعاملين',
      icon: 'pi pi-users',
      items: [
        { label: 'الفرق', icon: 'pi pi-sitemap', routerLink: '/teams' },
        { label: 'العاملين', icon: 'pi pi-user', routerLink: '/workers' },
        { label: 'تتبع المواقع', icon: 'pi pi-map-marker', routerLink: '/workers/map' },
      ]
    },
    {
      label: 'حزم العمل',
      icon: 'pi pi-box',
      routerLink: '/work-packages'
    },
    {
      label: 'جولات القراءة',
      icon: 'pi pi-chart-line',
      items: [
        { label: 'القوالب', icon: 'pi pi-file', routerLink: '/readings/templates' },
        { label: 'الجولات', icon: 'pi pi-calendar', routerLink: '/readings/rounds' },
      ]
    },
    {
      label: 'التقارير',
      icon: 'pi pi-chart-bar',
      routerLink: '/reports'
    },
    {
      label: 'الإعدادات',
      icon: 'pi pi-cog',
      routerLink: '/settings'
    },
  ];
}
