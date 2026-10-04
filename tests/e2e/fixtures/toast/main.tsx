import { createRoot } from "react-dom/client";
import { StrictMode, useRef } from "react";
import { ToastProvider, useToastNotice } from "../../../../apps/web/src/hooks/useToastNotice";
import { LanguageProvider } from "../../../../apps/web/src/i18n";
import "../../../../apps/web/src/styles.css";
function Harness() {
  const { notify, dismiss } = useToastNotice();
  const dialog = useRef<HTMLDialogElement>(null);
  return <main>
    {(["info", "success", "error", "warning"] as const).map(kind => <button key={kind} onClick={() => notify(`${kind} outcome`, kind)}>{kind}</button>)}
    <button onClick={() => {
      const id = notify("Saving snapshot", "info", { pending: true });
      setTimeout(() => { notify("Snapshot saved", "success"); dismiss(id); }, 6000);
    }}>pending</button>
    <button onClick={() => notify("Review draft", "warning", { actions: <button onClick={() => notify("Draft retained", "success")}>Keep draft</button> })}>action</button>
    <button onClick={() => dialog.current?.showModal()}>Open dialog</button>
    <dialog ref={dialog}><button onClick={() => notify("Inside dialog", "success")}>Dialog toast</button><button onClick={() => dialog.current?.close()}>Close dialog</button></dialog>
  </main>;
}
createRoot(document.getElementById("root")!).render(<StrictMode><LanguageProvider><ToastProvider><Harness /></ToastProvider></LanguageProvider></StrictMode>);
