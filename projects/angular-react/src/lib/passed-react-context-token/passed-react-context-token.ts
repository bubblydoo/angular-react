import { InjectionToken } from '@angular/core';
import { Context } from 'react';
import { Observable } from 'rxjs';
import { createRoot as origCreateRoot } from 'react-dom/client';

/** Read functions for React contexts, and a createRoot function */
export type PassedReactContext = {
  createRoot: typeof origCreateRoot;
  read: <T>(context: Context<T>) => Observable<T | undefined>;
  readCurrent: <T>(context: Context<T>) => T | undefined;
};

export const PassedReactContextToken = new InjectionToken<PassedReactContext>('PassedReactContext');
