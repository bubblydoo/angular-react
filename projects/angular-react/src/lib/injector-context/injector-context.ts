import { Injector } from '@angular/core';
import * as React from 'react';

export const InjectorContext = React.createContext<Injector | null>(null);
