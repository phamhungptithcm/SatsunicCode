import { useEffect, useRef } from "react";
import { useSession } from "../session";
import { changeProgress } from "../features/community/api";
/** Activity is navigation only; it cannot grant completion or a verdict. */
export function useLearningActivity(path: string | null) {
  const user = useSession(),
    last = useRef<string | null>(null);
  useEffect(() => {
    if (!user || user.isAnonymous || !path) return;
    const key = `${user.uid}:${path}`;
    if (last.current === key) return;
    last.current = key;
    let live = true;
    void changeProgress({ action: "activity", path }).catch(() => {
      if (live) last.current = null;
    });
    return () => {
      live = false;
    };
  }, [user?.uid, path]);
}
