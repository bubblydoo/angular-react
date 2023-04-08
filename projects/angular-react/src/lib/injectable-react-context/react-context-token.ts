import { InjectionToken } from '@angular/core';
import { InjectableReactContext } from './use-injectable-react-context';

export const ReactContextToken = new InjectionToken<InjectableReactContext>('ReactContext');
