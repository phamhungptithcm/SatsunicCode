import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth, authReady } from "./firebase";
import { stopGoogleAutoSignIn } from "./google-one-tap";
const Session = createContext<User | null>(null);
const Controls = createContext({
  ready: false,
  failed: false,
  promptVersion: 0,
  suppressed: false,
  requestGoogle: () => {},
  logout: async () => {},
});
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [promptVersion, setPromptVersion] = useState(0),
    [suppressed, setSuppressed] = useState(() => {
      try {
        return (
          sessionStorage.getItem("satsuniccode.one-tap-suppressed") === "true"
        );
      } catch {
        return false;
      }
    });
  useEffect(() => {
    let live = true;
    let stop: (() => void) | undefined;
    void authReady
      .then(() => {
        if (live)
          stop = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setReady(true);
          });
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
      stop?.();
    };
  }, []);
  return (
    <Controls.Provider
      value={{
        ready,
        failed,
        promptVersion,
        suppressed,
        requestGoogle: () => {
          setSuppressed(false);
          try {
            sessionStorage.removeItem("satsuniccode.one-tap-suppressed");
          } catch {}
          setPromptVersion((x) => x + 1);
        },
        logout: async () => {
          setSuppressed(true);
          try {
            sessionStorage.setItem("satsuniccode.one-tap-suppressed", "true");
          } catch {}
          stopGoogleAutoSignIn();
          await signOut(auth);
        },
      }}
    >
      <Session.Provider value={user}>
        <div key={user && !user.isAnonymous ? user.uid : "guest"}>
          {children}
        </div>
      </Session.Provider>
    </Controls.Provider>
  );
}
export const useSession = () => useContext(Session);
export const useAccountControls = () => useContext(Controls);
