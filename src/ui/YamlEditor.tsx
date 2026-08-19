import { useEffect, useRef, useState } from "react";
import { EditorView, Decoration, type DecorationSet } from "@codemirror/view";
import { EditorState, StateEffect, StateField, Compartment } from "@codemirror/state";
import { openSearchPanel } from "@codemirror/search";
import { basicSetup } from "codemirror";
import { yaml } from "@codemirror/lang-yaml";
import { parseDocument } from "yaml";
import { useTranslation } from "react-i18next";

const setErrorLine = StateEffect.define<number | null>();

const errorLineField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setErrorLine)) {
        if (effect.value === null) {
          deco = Decoration.none;
        } else {
          const line = tr.state.doc.line(Math.min(effect.value, tr.state.doc.lines));
          deco = Decoration.set([
            Decoration.line({ class: "cm-error-line" }).range(line.from),
          ]);
        }
      }
    }
    return deco;
  },
  provide: (field) => EditorView.decorations.from(field),
});

const editorTheme = EditorView.theme(
  {
    "&": { backgroundColor: "#10161d", color: "#e6edf3" },
    ".cm-gutters": {
      backgroundColor: "#10161d",
      color: "#3d4d5f",
      border: "none",
      borderRight: "1px solid #1a232e",
    },
    ".cm-activeLine": { backgroundColor: "#131a2280" },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "#8b98a5" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "#233246 !important",
    },
    ".cm-cursor": { borderLeftColor: "#e8a33d" },
    ".cm-panels": { backgroundColor: "#131a22", color: "#e6edf3" },
    ".cm-searchMatch": { backgroundColor: "#e8a33d33" },
    ".cm-searchMatch-selected": { backgroundColor: "#e8a33d66" },
  },
  { dark: true },
);

interface YamlEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  errorLine?: number | null;
  placeholder?: string;
  minHeight?: string;
}

export default function YamlEditor({
  value,
  onChange,
  readOnly = false,
  errorLine = null,
  minHeight = "20rem",
}: YamlEditorProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const readOnlyCompartment = new Compartment();
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          yaml(),
          editorTheme,
          errorLineField,
          readOnlyCompartment.of(EditorState.readOnly.of(readOnly)),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current?.(update.state.doc.toString());
          }),
          EditorView.lineWrapping,
        ],
      }),
      parent: containerRef.current,
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // The editor owns its document after mount; `value` prop changes sync below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly]);

  useEffect(() => {
    const view = viewRef.current;
    if (view && view.state.doc.toString() !== value) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    }
  }, [value]);

  useEffect(() => {
    viewRef.current?.dispatch({ effects: setErrorLine.of(errorLine) });
  }, [errorLine, value]);

  const format = () => {
    const doc = parseDocument(value);
    if (doc.errors.length === 0) onChangeRef.current?.(doc.toString({ lineWidth: 0 }));
  };

  const toolbarButton =
    "px-2.5 py-1 text-xs font-mono text-ink-300 hover:text-ink-100 hover:bg-ink-800 rounded transition-colors";

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-ink-950 p-4"
          : "flex flex-col rounded-lg border border-ink-700 bg-ink-900 overflow-hidden"
      }
    >
      <div className="flex items-center justify-end gap-1 border-b border-ink-800 bg-ink-850 px-2 py-1.5">
        {!readOnly && (
          <>
            <button type="button" className={toolbarButton} onClick={format}>
              {t("import.format")}
            </button>
            <button
              type="button"
              className={toolbarButton}
              onClick={() => onChangeRef.current?.("")}
            >
              {t("import.clear")}
            </button>
          </>
        )}
        <button
          type="button"
          className={toolbarButton}
          onClick={() => viewRef.current && openSearchPanel(viewRef.current)}
        >
          ⌕
        </button>
        <button
          type="button"
          className={toolbarButton}
          onClick={() => setFullscreen((f) => !f)}
        >
          {fullscreen ? t("import.exitFullscreen") : t("import.fullscreen")}
        </button>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        style={{ minHeight: fullscreen ? undefined : minHeight }}
      />
    </div>
  );
}
