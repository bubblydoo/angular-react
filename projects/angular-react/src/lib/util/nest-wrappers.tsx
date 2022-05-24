// Adapted from https://github.com/sincovschi/react-flat-providers/blob/main/src/core/flat-providers.tsx

import React, { PropsWithChildren } from "react";

export type Wrapper = ({ children }: { children: any }) => JSX.Element;

export function nestWrappers(
  PreviousWrapper: Wrapper,
  CurrentWrapper: Wrapper
) {
  return function NestedWrappers({
    children,
  }: PropsWithChildren<unknown>): JSX.Element {
    return (
      <PreviousWrapper>
        <CurrentWrapper>{children}</CurrentWrapper>
      </PreviousWrapper>
    );
  };
}
