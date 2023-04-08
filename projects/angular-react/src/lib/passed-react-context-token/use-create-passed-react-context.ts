import { useContextMap, ContextMap } from 'its-fine';
import { useEffect, useMemo } from 'react';
import { BehaviorSubject, distinctUntilChanged, Subject } from 'rxjs';
import { map } from 'rxjs';
import { PassedReactContext } from './passed-react-context-token';
import { createRoot as origCreateRoot } from 'react-dom/client';

/** Creates a PassedReactContext */
export function useCreatePassedReactContext(createRoot: typeof origCreateRoot) {
  const contextMap = useContextMap();
  const all$ = useMemo(() => new BehaviorSubject<ContextMap>(contextMap), []);

  all$.next(contextMap);

  const passedReactContext: PassedReactContext = useMemo(
    () => ({
      createRoot,
      read: (x) =>
        all$.pipe(
          map((contexts) => contexts.get(x)),
          distinctUntilChanged()
        ),
      readCurrent: (x) => all$.value?.get(x),
    }),
    [createRoot, all$]
  );

  return passedReactContext;
}
