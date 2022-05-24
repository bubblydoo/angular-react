import { InjectFlags, ProviderToken } from '@angular/core';
import { useContext } from 'react';
import { InjectorContext } from '../injector-context/injector-context';

type PublicInterface<T> = Pick<T, keyof T>;

type ProviderTokenTypeHelper<T> = T extends ProviderToken<T>
  ? ProviderToken<T>
  : PublicInterface<ProviderToken<T>>;

function useInjected<T>(
  token: ProviderTokenTypeHelper<T>,
  notFoundValue?: T,
  flags?: InjectFlags
): T {
  const injector = useContext(InjectorContext);
  if (!injector)
    throw new Error('`useInjected` needs to be used inside an Angular context');
  return injector.get(token as ProviderToken<T>, notFoundValue, flags);
}

export default useInjected;
