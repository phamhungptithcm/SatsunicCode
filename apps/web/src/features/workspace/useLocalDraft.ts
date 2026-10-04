import { useEffect, useRef, useState } from "react";
import { parseDraft } from "./drafts";
export function useLocalDraft(key: string, starter: string) {
  const initial = useRef<{
    source: string;
    revision: number;
    blocked: boolean;
    recovered: boolean;
    hasStored: boolean;
    conflicting: boolean;
  } | null>(null);
  if (!initial.current) {
    try {
      const saved = parseDraft(localStorage.getItem(key));
      const recovery = parseDraft(sessionStorage.getItem(`${key}:recovery`));
      initial.current = {
        source: recovery?.source ?? saved?.source ?? starter,
        revision: saved?.revision ?? -1,
        blocked: false,
        recovered: !!recovery && recovery.source !== saved?.source,
        conflicting:
          !!recovery &&
          !!saved &&
          recovery.source !== saved.source &&
          saved.revision >= recovery.revision,
        hasStored: !!(saved || recovery),
      };
    } catch {
      initial.current = {
        source: starter,
        revision: -1,
        blocked: true,
        recovered: false,
        conflicting: false,
        hasStored: false,
      };
    }
  }
  const [source, setSource] = useState(initial.current.source);
  const [state, setState] = useState<
    "saved" | "changed" | "error" | "conflict"
  >(
    initial.current.blocked
      ? "error"
      : initial.current.conflicting
        ? "conflict"
        : initial.current.recovered || !initial.current.hasStored
          ? "changed"
          : "saved",
  );
  const revision = useRef(initial.current.revision);
  const current = useRef(source);
  const dirty = useRef(initial.current.recovered || !initial.current.hasStored);
  const conflict = useRef(initial.current.conflicting);
  const backup = useRef<string | null>(null);
  function persist() {
    if (!dirty.current || conflict.current) return;
    try {
      const existing = parseDraft(localStorage.getItem(key));
      if ((existing?.revision ?? -1) !== revision.current) {
        conflict.current = true;
        setState("conflict");
        return;
      }
      const next = {
        source: current.current,
        revision: revision.current + 1,
        updatedAt: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(next));
      revision.current = next.revision;
      dirty.current = false;
      // Keep this tab's recovery copy: localStorage comparison is not atomic across tabs.
      setState("saved");
    } catch {
      setState("error");
    }
  }
  function edit(value: string) {
    current.current = value;
    dirty.current = true;
    setSource(value);
    try {
      sessionStorage.setItem(
        `${key}:recovery`,
        JSON.stringify({
          source: value,
          revision: revision.current + 1,
          updatedAt: Date.now(),
        }),
      );
      setState(conflict.current ? "conflict" : "changed");
    } catch {
      setState("error");
    }
  }
  function reload() {
    try {
      const latest = parseDraft(localStorage.getItem(key));
      backup.current = current.current;
      current.current = latest?.source ?? starter;
      revision.current = latest?.revision ?? -1;
      dirty.current = false;
      conflict.current = false;
      sessionStorage.removeItem(`${key}:recovery`);
      setSource(current.current);
      setState("saved");
    } catch {
      setState("error");
    }
  }
  function reset() {
    backup.current = current.current;
    edit(starter);
  }
  function undo() {
    if (backup.current !== null) {
      const previous = backup.current;
      backup.current = null;
      edit(previous);
    }
  }
  useEffect(() => {
    const timer = window.setTimeout(persist, 750);
    return () => window.clearTimeout(timer);
  }, [source, key]);
  useEffect(() => {
    function external(e: StorageEvent) {
      if (
        e.key === key &&
        (parseDraft(e.newValue)?.revision ?? -1) !== revision.current
      ) {
        conflict.current = true;
        setState("conflict");
      }
    }
    function beforeUnload(e: BeforeUnloadEvent) {
      persist();
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    function pageHide() {
      persist();
    }
    window.addEventListener("storage", external);
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("pagehide", pageHide);
    return () => {
      persist();
      window.removeEventListener("storage", external);
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("pagehide", pageHide);
    };
  }, [key]);
  return {
    source,
    edit,
    state,
    persist,
    reload,
    reset,
    undo,
    hasStored: initial.current.hasStored,
    canUndo: backup.current !== null,
  };
}
