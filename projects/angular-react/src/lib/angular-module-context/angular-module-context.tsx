import { NgModuleRef } from "@angular/core";
import { useContextBridge } from "its-fine";
import React, { useEffect, useLayoutEffect } from "react";
import { AngularReactService } from "../angular-react.service";
import useInjected from "../use-injected/use-injected";

export const AngularModuleContext =
  React.createContext<NgModuleRef<any> | null>(null);

export function AngularModuleContextProvider({
  moduleRef,
  children,
}: {
  moduleRef: NgModuleRef<any>;
  children: React.ReactNode;
}) {
  if (!moduleRef)
    throw new Error("No moduleRef passed to AngularModuleContextProvider");

  return (
    <AngularModuleContext.Provider value={moduleRef}>
      {children}
    </AngularModuleContext.Provider>
  );
}

let teardownTimes = 0;

export function useAngularReactRootCOntextBridge() {
  const ContextBridge = useContextBridge();
  const angularReact = useInjected(AngularReactService);

  useLayoutEffect(() => {
    // we trigger the render$ observable here, so that the nested context bridges are rerendered
    // per https://github.com/pmndrs/its-fine/issues/26#issuecomment-1465921865
    // this should be a render-effect, but this causes the following React warning:
    // "Render methods should be a pure function of props and state; triggering nested component updates from render is not allowed.""
    angularReact.render$.next();
  });

  useEffect(() => {
    function AngularReactRootContextBridgeWrapper({ children }: { children: any }) {
      return <ContextBridge>{children}</ContextBridge>
    };
    angularReact.wrappers.push(AngularReactRootContextBridgeWrapper);

    return () => {
      const index = angularReact.wrappers.indexOf(AngularReactRootContextBridgeWrapper);
      if (index > -1) angularReact.wrappers.splice(index, 1);
    };
  }, [ContextBridge, angularReact.wrappers]);

  useEffect(() => {
    return () => {
      teardownTimes++;
      if (teardownTimes > 100) {
        console.warn(
          "AngularReactRootContextBridge was torn down more than 100 times. " +
            'If it is contained within a react-wrapper, make sure the react-wrapper has [ignoreWrappers]="true", or it will cause infinte loops.'
        );
      }
    };
  }, []);
}

export function AngularReactRootContextBridge() {
  useAngularReactRootCOntextBridge();

  return null;
}
