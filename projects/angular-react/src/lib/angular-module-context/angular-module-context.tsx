import { NgModuleRef } from "@angular/core";
import { FiberProvider } from "@bubblydoo/its-fine";
import React from "react";

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
    <FiberProvider>
      <AngularModuleContext.Provider value={moduleRef}>
        {children}
      </AngularModuleContext.Provider>
    </FiberProvider>
  );
}
