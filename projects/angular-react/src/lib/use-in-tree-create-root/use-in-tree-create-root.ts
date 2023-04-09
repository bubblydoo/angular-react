import { ReactNode, useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Root, createRoot as origCreateRoot } from "react-dom/client";

/**
 * Behaves like `createRoot` but instead of creating a new root,
 * it puts the children in returned `portals`, which binds them to their context.
 *
 * Usage example:
 * ```
 * const { createRoot, portals } = useInTreeCreateRoot();
 *
 * const root = createRoot(document.body);
 * root.render(<SomethingUsingContexts />);
 *
 * return <>{portals}</>
 * ```
 */
export function useInTreeCreateRoot() {
  const [roots, setRoots] = useState<Map<Element | DocumentFragment, ReactNode>>(new Map());

  const createRoot: typeof origCreateRoot = useCallback((container, options) => {
    const root: Root = {
      render: (children) => {
        setRoots(roots => {
          const newRoots = new Map(roots);
          newRoots.set(container, children);
          return newRoots;
        });
      },
      unmount: () => {
        setRoots(roots => {
          const newRoots = new Map(roots);
          newRoots.delete(container);
          return newRoots;
        });
      }
    }
    setRoots(roots => {
      return new Map(roots).set(container, null);
    });
    return root;
  }, []);

  const portals = useMemo(() => {
    return [...roots.entries()].map(([container, root]) => {
      return createPortal(root, container);
    })
  }, [roots]);

  return { createRoot, portals };
}
