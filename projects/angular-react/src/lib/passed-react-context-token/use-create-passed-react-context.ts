import { useContextMap, useContextBridge, ContextMap } from 'its-fine';
import { useLayoutEffect, useMemo } from 'react';
import { BehaviorSubject, distinctUntilChanged, filter, Subject } from 'rxjs';
import { map } from 'rxjs';
import { PassedReactContext } from './passed-react-context-token';

/** Creates a PassedReactContext, which is a ContextBridge and a render observable */
export function useCreatePassedReactContext() {
  const contextMap = useContextMap();
  const ContextBridge = useContextBridge();
  const render$ = useMemo(() => new Subject<void>(), []);
  const all$ = useMemo(() => new BehaviorSubject<ContextMap>(contextMap), []);

  all$.next(contextMap);

  const passedReactContext: PassedReactContext = useMemo(
    () => ({
      ContextBridge,
      render$,
      read: (x) =>
        all$.pipe(
          map((contexts) => contexts.get(x)),
          distinctUntilChanged()
        ),
      readCurrent: (x) => all$.value?.get(x),
    }),
    [ContextBridge, render$, all$]
  );

  useLayoutEffect(() => {
    render$.next();
  });

  return passedReactContext;
}
