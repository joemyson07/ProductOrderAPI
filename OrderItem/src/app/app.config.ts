import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { API_BASE_URL } from './core/config/api.config';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    { provide: API_BASE_URL, useValue: '/api' },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};