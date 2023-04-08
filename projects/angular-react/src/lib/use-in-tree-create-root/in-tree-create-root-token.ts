import { InjectionToken } from '@angular/core';
import { createRoot } from 'react-dom/client';

export const InTreeCreateRootToken = new InjectionToken<typeof createRoot>('InTreeCreateRoot');
