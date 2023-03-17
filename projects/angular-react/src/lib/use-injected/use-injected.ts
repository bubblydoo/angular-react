import { InjectFlags, ProviderToken } from '@angular/core';
import { useContext } from 'react';
import { AngularInjectorContext } from '../angular-context/angular-context';

type PublicInterface<T> = Pick<T, keyof T>;

type ProviderTokenTypeHelper<T> = T extends ProviderToken<T>
  ? ProviderToken<T>
  : PublicInterface<ProviderToken<T>>;

export function useInjected<T = any>(
  token: ProviderTokenTypeHelper<T>,
  notFoundValue?: T,
  flags?: InjectFlags
): T {
  const injector = useContext(AngularInjectorContext);
  if (!injector)
    throw new Error('`useInjected` needs to be used inside an Angular context');
  return injector.get(token as ProviderToken<T>, notFoundValue, flags);
}
