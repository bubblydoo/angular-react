import { useMemo } from "react";

export function NestWrappers(props: { wrappers: Wrapper[]; children: any }) {
  const wrappers = props.wrappers;

  // flatten the wrappers into one component
  const NestedWrappers = useMemo(
    () =>
      wrappers.length
        ? wrappers.reduce(nestWrappers)
        : (props: any) => props.children,
    [wrappers]
  );

  return <NestedWrappers>{props.children}</NestedWrappers>;
}

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
