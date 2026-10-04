import Editor, { loader } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution.js";
import "monaco-editor/esm/vs/basic-languages/python/python.contribution.js";
import "monaco-editor/esm/vs/basic-languages/java/java.contribution.js";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
self.MonacoEnvironment = {
  getWorker(_id, label) {
    return label === "typescript" || label === "javascript"
      ? new TsWorker()
      : new EditorWorker();
  },
};
loader.config({ monaco });
monaco.editor.defineTheme("satsunic-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [{ token: "comment", foreground: "8DBF82" }],
  colors: {},
});
export default function CodeEditor({
  value,
  language,
  onChange,
  readOnly,
  path,
  height = "420px",
}: {
  value: string;
  language: string;
  onChange: (value: string | undefined) => void;
  readOnly: boolean;
  path?: string;
  height?: string;
}) {
  const [theme, setTheme] = useState(
    document.body.dataset.theme === "dark" ? "satsunic-dark" : "vs",
  );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setTheme(document.body.dataset.theme === "dark" ? "satsunic-dark" : "vs"),
    );
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return (
    <Editor
      height={height}
      path={path}
      keepCurrentModel={false}
      theme={theme}
      language={language}
      value={value}
      onChange={onChange}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 15,
        accessibilitySupport: "on",
        ariaLabel: "Source code editor",
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
      }}
    />
  );
}
