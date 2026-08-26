import { useEffect, useRef, useState } from "react";
import { EditorView, Decoration, type DecorationSet } from "@codemirror/view";
import { EditorState, StateEffect, StateField, Compartment } from "@codemirror/state";
import { openSearchPanel } from "@codemirror/search";
import { basicSetup } from "codemirror";
import { yaml } from "@codemirror/lang-yaml";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
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

// Colors resolve through the semantic CSS vars in index.css, so the editor
// follows the system color scheme; only CodeMirror's `dark` flag needs JS.
const editorTheme = (dark: boolean) =>
  EditorView.theme(
    {
      "&": { backgroundColor: "var(--surface)", color: "var(--fg)" },
      ".cm-gutters": {
        backgroundColor: "var(--surface)",
        color: "var(--fg-faint)",
        border: "none",
        borderRight: "1px solid var(--line-soft)",
      },
      ".cm-activeLine": {
        backgroundColor: "color-mix(in srgb, var(--overlay) 50%, transparent)",
      },
      ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--fg-muted)" },
      ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
        backgroundColor: "var(--sel) !important",
      },
      ".cm-cursor": { borderLeftColor: "var(--accent)" },
      ".cm-panels": { backgroundColor: "var(--raised)", color: "var(--fg)" },
      ".cm-searchMatch": {
        backgroundColor: "color-mix(in srgb, var(--accent) 20%, transparent)",
      },
      ".cm-searchMatch-selected": {
        backgroundColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
      },
    },
    { dark },
  );

const yamlHighlight = HighlightStyle.define([
  { tag: [tags.definition(tags.propertyName), tags.propertyName], color: "var(--syn-key)" },
  { tag: tags.string, color: "var(--syn-string)" },
  { tag: tags.number, color: "var(--syn-number)" },
  { tag: [tags.bool, tags.null, tags.atom, tags.keyword], color: "var(--syn-atom)" },
  { tag: tags.comment, color: "var(--syn-comment)", fontStyle: "italic" },
]);

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
    const themeCompartment = new Compartment();
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          yaml(),
          syntaxHighlighting(yamlHighlight),
          themeCompartment.of(editorTheme(scheme.matches)),
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
    const onSchemeChange = (e: MediaQueryListEvent) =>
      view.dispatch({ effects: themeCompartment.reconfigure(editorTheme(e.matches)) });
    scheme.addEventListener("change", onSchemeChange);
    return () => {
      scheme.removeEventListener("change", onSchemeChange);
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
    "px-2.5 py-1 text-xs font-mono text-fg-muted hover:text-fg hover:bg-overlay rounded transition-colors";

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-page p-4"
          : "flex flex-col rounded-lg border border-line bg-surface overflow-hidden"
      }
    >
      <div className="flex items-center justify-end gap-1 border-b border-line-soft bg-raised px-2 py-1.5">
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
