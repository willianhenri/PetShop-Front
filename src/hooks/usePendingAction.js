import { useRef, useState } from 'react';

export function usePendingAction() {
  const locked = useRef(new Set());
  const [pending, setPending] = useState(new Set());
  async function run(id, action) {
    if (locked.current.has(id)) return;
    locked.current.add(id);
    setPending(new Set(locked.current));
    try {
      await action();
    } finally {
      locked.current.delete(id);
      setPending(new Set(locked.current));
    }
  }
  return { pending, run };
}
