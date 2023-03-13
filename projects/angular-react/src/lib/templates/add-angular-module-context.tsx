import { type NgModuleRef } from "@angular/core";
import React, { useContext, useMemo } from "react";
import { AngularModuleContext, AngularModuleContextProvider } from "../angular-module-context/angular-module-context";

export function addAngularModuleContext<
  P extends {},
  T extends React.ComponentType<P>
>(Component: T, moduleRef: NgModuleRef<any>): T {
  if (!moduleRef)
    throw new Error("No moduleRef passed to addAngularModuleContext");

  const addAngularModuleContextHOC = (props: any) => {
    return (
      <AngularModuleContextProvider moduleRef={moduleRef}>
        <Component {...props} />
      </AngularModuleContextProvider>
    );
  };

  addAngularModuleContextHOC.displayName = "addAngularModuleContextHOC";

  return addAngularModuleContextHOC as unknown as T;
}

export function useAngularModuleContextInComponent<
  P extends {},
  T extends React.ComponentType<P>
>(Component: T): T {
  const moduleRef = useContext(AngularModuleContext);
  if (!moduleRef)
    throw new Error("AngularModuleContext is required in useAngularModuleContextInComponent");
  return useMemo(
    () => addAngularModuleContext<P, T>(Component, moduleRef),
    [Component, moduleRef]
  );
}
