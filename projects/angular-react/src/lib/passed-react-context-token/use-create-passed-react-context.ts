import { useContextMap, useContextBridge, ContextMap } from 'its-fine';
import { useEffect, useMemo } from 'react';
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

  // needs to be in a next "task" otherwise React is still rendering
  // causing this error:
  // "Render methods should be a pure function of props and state;
  // triggering nested component updates from render is not allowed.
  // If necessary, trigger nested updates in componentDidUpdate."
  // (not using useLayoutEffect because that causes annoying warnings in SSR)
  useEffect(() => render$.next());

  return passedReactContext;
}
