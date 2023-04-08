import { NgModuleRef, Injector } from "@angular/core";
import { FiberProvider } from "its-fine";
import React from "react";

export const AngularModuleContext =
  React.createContext<NgModuleRef<any> | null>(null);

AngularModuleContext.displayName = "AngularModuleContext";

export const AngularInjectorContext =
  React.createContext<Injector | null>(null);

AngularInjectorContext.displayName = "AngularInjectorContext";

export function RootAngularContextProvider({
  moduleRef,
  injector,
  children,
}: {
  moduleRef: NgModuleRef<any>;
  injector?: Injector;
  children: React.ReactNode;
}) {
  if (!moduleRef)
    throw new Error("No moduleRef passed to RootAngularContextProvider");

  return (
    <FiberProvider>
      <AngularModuleContext.Provider value={moduleRef}>
        <AngularInjectorContext.Provider value={injector || moduleRef.injector}>
          {children}
        </AngularInjectorContext.Provider>
      </AngularModuleContext.Provider>
    </FiberProvider>
  );
}
