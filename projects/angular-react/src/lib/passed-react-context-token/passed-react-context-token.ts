import { InjectionToken } from '@angular/core';
import { type ContextBridge as ContextBridgeType } from "its-fine";
import { Context } from 'react';
import { Observable, Subject } from 'rxjs';

/** A read function for React contexts, a ContextBridge and a render$ observable */
export type PassedReactContext = {
  ContextBridge: ContextBridgeType;
  render$: Subject<void>;
  read: <T>(context: Context<T>) => Observable<T | undefined>;
  readCurrent: <T>(context: Context<T>) => T | undefined;
};

export const PassedReactContextToken = new InjectionToken<PassedReactContext>('PassedReactContext');
