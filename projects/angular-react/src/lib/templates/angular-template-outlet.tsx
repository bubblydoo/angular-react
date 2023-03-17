import { type NgModuleRef, type TemplateRef } from '@angular/core';
import React, { useCallback, useMemo, useContext } from "react";
import { AngularModuleContext } from "../angular-context/angular-context";
import { AngularReactService } from "../angular-react.service";
import { AngularWrapper } from "../angular-wrapper/angular-wrapper";
import { nestWrappers } from "../nest-wrappers/nest-wrappers";
import { useInjected } from "../use-injected/use-injected";
import { TemplateOutletComponent } from "./template-outlet.component";

type Props = {
  tmpl: TemplateRef<any>;
  tmplContext?: Record<string, any>;
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

export const useFromAngularTemplateRefFnWithModule = (
  moduleRef: NgModuleRef<any>
) => {
  const angularReactService = useInjected(AngularReactService);
  if (!angularReactService)
    throw new Error(
      "AngularReactService is required when using useFromAngularTemplateRefWithModule"
    );

  return useCallback(
    function FromAngularTemplateRef(
      tmpl: TemplateRef<any>,
      tmplContext: Record<string, any> = {}
    ) {
      return nestWrappers(
        angularReactService.wrappers,
        <AngularTemplateOutlet tmpl={tmpl} tmplContext={tmplContext} />
      );
    },
    [moduleRef, angularReactService]
  );
};

export const useFromAngularTemplateRefFn = () => {
  const moduleRef = useContext(AngularModuleContext);
  if (!moduleRef) throw new Error("No AngularModuleContext");
  return useFromAngularTemplateRefFnWithModule(moduleRef);
};

export function useFromAngularTemplateRef<C extends Record<string, any>>(
  templateRef: TemplateRef<C>
) {
  const fn = useFromAngularTemplateRefFn();
  return useMemo(
    () => (tmplContext: C) => fn(templateRef, tmplContext),
    [templateRef, fn]
  );
}
