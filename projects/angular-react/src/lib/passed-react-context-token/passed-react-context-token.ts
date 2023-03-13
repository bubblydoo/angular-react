import { InjectionToken } from '@angular/core';
import { type ContextBridge as ContextBridgeType } from "its-fine";
import { Subject } from 'rxjs';

/** A ContextBridge and a render$ observable */
export type PassedReactContext = {
  ContextBridge: ContextBridgeType;
  render$: Subject<void>;
};

export const PassedReactContextToken = new InjectionToken<PassedReactContext>('PassedReactContext');
