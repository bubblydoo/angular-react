// TODO: move to @bubblydoo/angular-react
import { type NgModuleRef, type TemplateRef } from '@angular/core';
import React, { useCallback, useMemo, useContext } from "react";
import { AngularModuleContext } from "../angular-module-context/angular-module-context";
import AngularWrapper from "../angular-wrapper/angular-wrapper";
import { TemplateOutletComponent } from "./template-outlet.component";

type Props = {
  tmpl: TemplateRef<any>;
  tmplContext: Record<string, any>;
};

export function AngularTemplateOutlet({ tmpl, tmplContext }: Props) {
  const inputs = useMemo(() => ({ tmpl, tmplContext }), [tmpl, tmplContext]);

  return (
    <AngularWrapper
      name="template-outlet"
      component={TemplateOutletComponent}
      inputs={inputs}
    />
  );
}

export const useFromAngularTemplateRefWithModule = (moduleRef: NgModuleRef<any>) => {
  return useCallback(
    (tmpl: TemplateRef<any>, tmplContext: Record<string, any> = {}) => {
      return <AngularModuleContext.Provider value={moduleRef}>
        <AngularTemplateOutlet tmpl={tmpl} tmplContext={tmplContext}/>
      </AngularModuleContext.Provider>;
    },
    [moduleRef]
  );
};

export const useFromAngularTemplateRefFn = () => {
  const moduleRef = useContext(AngularModuleContext);
  if (!moduleRef) throw new Error("No AngularModuleContext");
  return useFromAngularTemplateRefWithModule(moduleRef);
};

export function useFromAngularTemplateRef<C extends Record<string, any>>(templateRef: TemplateRef<C>) {
  const fn = useFromAngularTemplateRefFn();
  return useMemo(() => (tmplContext: C) => fn(templateRef, tmplContext), [templateRef]);
}
