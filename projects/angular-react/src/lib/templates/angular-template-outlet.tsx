// TODO: move to @bubblydoo/angular-react
import { type NgModuleRef, type TemplateRef } from '@angular/core';
import React, { useCallback, useMemo, useContext } from 'react';
import { AngularModuleContext } from '../angular-module-context/angular-module-context';
import AngularWrapper from '../angular-wrapper/angular-wrapper';
import { TemplateOutletComponent } from './template-outlet.component';

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
};

export const fromTemplateRef = (
  tmpl: TemplateRef<any>,
  tmplContext: Record<string, any> = {},
  moduleRef: NgModuleRef<any>
) => (
  <AngularModuleContext.Provider value={moduleRef}>
    <AngularTemplateOutlet tmpl={tmpl} tmplContext={tmplContext}></AngularTemplateOutlet>
  </AngularModuleContext.Provider>
);

export const useFromTemplateRefWithModule = (moduleRef: NgModuleRef<any>) => {
  return useCallback(
    (tmpl: TemplateRef<any>, tmplContext: Record<string, any> = {}) =>
      fromTemplateRef(tmpl, tmplContext, moduleRef),
    [moduleRef]
  );
}

export const useFromTemplateRef = () => {
  const moduleRef = useContext(AngularModuleContext);
  if (!moduleRef) throw new Error("No AngularModuleContext");
  return useFromTemplateRefWithModule(moduleRef);
}
