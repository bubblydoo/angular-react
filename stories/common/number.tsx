import React, { useContext } from "react";

export const NumberContext = React.createContext<number | undefined>(undefined);

export function NumberDisplay() {
  const number = useContext(NumberContext);

  return (
    <div style={{ border: "1px solid", padding: "5px", margin: "5px" }}>
      <p>this is React: {number ?? "no number"}</p>
    </div>
  );
}
