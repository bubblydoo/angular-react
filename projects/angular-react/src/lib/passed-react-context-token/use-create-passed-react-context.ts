import { useAllContexts, useContextBridge } from 'its-fine';
import { useLayoutEffect, useMemo } from 'react';
import { distinctUntilChanged, ReplaySubject, Subject } from 'rxjs';
import { map } from 'rxjs';
import { PassedReactContext } from './passed-react-context-token';

/** Creates a PassedReactContext, which is a ContextBridge and a render observable */
export function useCreatePassedReactContext() {
  const contexts = useAllContexts();
  const ContextBridge = useContextBridge();
  const render$ = useMemo(() => new Subject<void>(), []);
  const all$ = useMemo(() => new ReplaySubject<Map<any, any>>(1), []);

  all$.next(contexts);

  const passedReactContext: PassedReactContext = useMemo(
    () => ({
      ContextBridge,
      render$,
      read: (x) => all$.pipe(map((contexts) => contexts.get(x)), distinctUntilChanged()),
    }),
    [ContextBridge, render$, all$]
  );

  useLayoutEffect(() => {
    render$.next();
  });

  return passedReactContext;
}
