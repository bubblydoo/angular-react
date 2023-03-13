import { useContextBridge } from "its-fine";
import { useLayoutEffect, useMemo } from "react";
import { Subject } from "rxjs";
import { PassedReactContext } from "./passed-react-context-token";

/** Creates a PassedReactContext, which is a ContextBridge and a render observable */
export function useCreatePassedReactContext() {
  const ContextBridge = useContextBridge();
  const render$ = useMemo(() => new Subject<void>(), []);
  const passedReactContext: PassedReactContext = useMemo(
    () => ({ ContextBridge, render$ }),
    [ContextBridge, render$]
  );

  useLayoutEffect(() => {
    render$.next();
  });

  return passedReactContext
}
