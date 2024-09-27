import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  NbActionsModule,
  NbCardModule,
  NbLayoutModule,
  NbMenuModule,
  NbSidebarModule,
  NbThemeModule,
  NbCheckboxModule,
  NbPopoverModule,
  NbContextMenuModule,
  NbButtonModule,
  NbInputModule,
  NbDialogModule,
  NbSpinnerModule,
  NbTooltipModule,
  NbTabsetModule,
  NbUserModule,
  NbBadgeModule,
  NbIconModule,
  NbFormFieldModule,
  NbListModule,
  NbToastrModule,
  NbToggleModule,
  NbAccordionModule,
  NbChatModule,
  NbProgressBarModule,
  NbSelectModule,
} from '@nebular/theme';
import { NbAuthModule } from '@nebular/auth';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgSelectModule } from '@ng-select/ng-select';

const BASE_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  NgSelectModule,
];

const NB_MODULES = [
  NbCardModule,
  NbLayoutModule,
  NbMenuModule,
  NbListModule,
  NbTabsetModule,
  NbActionsModule,
  NbSidebarModule,
  NbCheckboxModule,
  NbPopoverModule,
  NbContextMenuModule,
  NbButtonModule,
  NbListModule,
  NbInputModule,
  NbDialogModule,
  NbSpinnerModule,
  NbTooltipModule,
  NbUserModule,
  NbAuthModule,
  NbBadgeModule,
  NbIconModule,
  NbFormFieldModule,
  NbToggleModule,
  NbAccordionModule,
  NbChatModule,
  NbProgressBarModule,
  NbSelectModule,
];

const NB_THEME_PROVIDERS = [
  ...NbThemeModule.forRoot({
    name: 'default',
  }).providers,
  ...NbSidebarModule.forRoot().providers,
  ...NbMenuModule.forRoot().providers,
  ...NbDialogModule.forRoot().providers,
  ...NbAuthModule.forRoot().providers,
  ...NbToastrModule.forRoot().providers,
];

const MaterialModules = [
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatCheckboxModule,
  MatRadioModule,
  FlexLayoutModule,
];

@NgModule({
  imports: [...BASE_MODULES, ...NB_MODULES, ...MaterialModules],
  exports: [...BASE_MODULES, ...NB_MODULES, ...MaterialModules],
  declarations: [],
})
export class ThemeModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ThemeModule,
      providers: [...NB_THEME_PROVIDERS],
    } as ModuleWithProviders;
  }
}
