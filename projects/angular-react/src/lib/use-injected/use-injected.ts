import { InjectFlags, ProviderToken } from '@angular/core';
import { AngularModuleContext } from '../angular-module-context/angular-module-context';
import { useContext } from 'react';

type PublicInterface<T> = Pick<T, keyof T>;

type ProviderTokenTypeHelper<T> = T extends ProviderToken<T>
  ? ProviderToken<T>
  : PublicInterface<ProviderToken<T>>;

export function useInjected<T = any>(
  token: ProviderTokenTypeHelper<T>,
  notFoundValue?: T,
  flags?: InjectFlags
): T {
  const ngModuleRef = useContext(AngularModuleContext);
  if (!ngModuleRef)
    throw new Error('`useInjected` needs to be used inside an Angular context');
  const injector = ngModuleRef.injector;
  return injector.get(token as ProviderToken<T>, notFoundValue, flags);
}
