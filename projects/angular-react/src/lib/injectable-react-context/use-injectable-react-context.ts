import { useContextMap, ContextMap } from 'its-fine';
import { Context, useMemo } from 'react';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';
import { map } from 'rxjs';

/** Read functions for React contexts */
export type InjectableReactContext = {
  read: <T>(context: Context<T>) => Observable<T | undefined>;
  readCurrent: <T>(context: Context<T>) => T | undefined;
};

/** Creates a PassedReactContext */
export function useInjectableReactContext() {
  const contextMap = useContextMap();
  const all$ = useMemo(() => new BehaviorSubject<ContextMap>(contextMap), []);

  all$.next(contextMap);

  const injectableReactContext: InjectableReactContext = useMemo(
    () => ({
      read: (x) =>
        all$.pipe(
          map((contexts) => contexts.get(x)),
          distinctUntilChanged()
        ),
      readCurrent: (x) => all$.value?.get(x),
    }),
    [all$]
  );

  return injectableReactContext;
}
