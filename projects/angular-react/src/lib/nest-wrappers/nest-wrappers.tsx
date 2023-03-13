import React from "react";

export type Wrapper = ({ children }: { children: any }) => any;

export function nestWrappers(wrappers: Wrapper[], children: any) {
  for (const Wrapper of wrappers.slice().reverse()) {
    children = <Wrapper>{children}</Wrapper>
  }

  return children;
}
