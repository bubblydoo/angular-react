import { useEffect, useState } from 'react';
import { Observable, Subscribable } from 'rxjs';

export function useObservable<T = any>(
  observable: Observable<T> | Subscribable<T>,
  _default: T | null = null
) {
  const [next, setNext] = useState<T | null>(_default);
  const [error, setError] = useState<any>(null);
  const [complete, setComplete] = useState<boolean>(false);
  useEffect(() => {
    const subscription = observable.subscribe({
      next: (next) => setNext(next),
      error: (error) => {
        console.error("Error emitted by observable (in useObservable)", error);
        setError(error)
      },
      complete: () => setComplete(true),
    });
    return () => subscription.unsubscribe();
  }, [observable]);
  return [next, error, complete] as const;
}
