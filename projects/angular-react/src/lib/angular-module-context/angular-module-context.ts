import { NgModuleRef } from '@angular/core';
import React from 'react';

export const AngularModuleContext = React.createContext<NgModuleRef<any> | null>(null);
