import { useEffect, useState } from 'react';
import { Observable, Subscribable } from 'rxjs';

function useObservable<T = any>(
  observable: Observable<T> | Subscribable<T>,
  _default: T | null = null
) {
  const [next, setNext] = useState<T | null>(_default);
  const [error, setError] = useState<T | null>(null);
  const [complete, setComplete] = useState<boolean>(false);
  useEffect(() => {
    const subscription = observable.subscribe({
      next: (next) => setNext(next),
      error: (error) => setError(error),
      complete: () => setComplete(true),
    });
    return () => subscription.unsubscribe();
  }, [observable]);
  return [next, error, complete] as const;
}

export default useObservable;
