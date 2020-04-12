import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { PeriodicTableModule } from '../../features/periodic-table/periodic-table.module';
import { HttpClientModule } from '@angular/common/http';
import { InViewportModule } from '@ngx-starter-kit/ngx-utils';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    SharedModule,
    HttpClientModule,
    InViewportModule,
    PeriodicTableModule,
    CustomMaterialModule,
    RouterModule.forChild([{ path: '', component: HomeComponent }]),
  ],
})
export class HomeModule {}
