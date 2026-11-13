import { motion } from "motion/react";
import { useRef, useState } from "react";
import { BookOpen, Sparkles, Upload } from "lucide-react";
import { parsePackageJson, type ParseResult } from "@/domain/parse";
import { SAMPLE_PACKAGE_JSON } from "@/domain/sample";
import { StatusIcon } from "@/graves/icons/StatusIcon";
import { useT } from "@/i18n";
import { useReduce } from "@/store/useReduce";
import { useStore } from "@/store/useStore";

type Failure = Extract<ParseResult, { ok: false }>;

const HERALDS = ["alive", "zombie", "ghost", "buried"] as const;

export function Gate() {
  const { draft, setDraft, includePeer, setIncludePeer, includeOptional, setIncludeOptional, summon } = useStore();
  const [failure, setFailure] = useState<Failure | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const reduce = useReduce();
  const { t } = useT();

  function submit(text: string) {
    const result = parsePackageJson(text, { includePeer, includeOptional });
    if (!result.ok) {
      setFailure(result);
      return;
    }
    setFailure(null);
    summon({ specs: result.specs, packageName: result.packageName, truncated: result.truncated, now: Date.now() });
  }

  async function readFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 2_000_000) {
      setFailure({ ok: false, code: "too_large" });
      return;
    }
    const text = await file.text();
    setDraft(text);
    submit(text);
  }

  return (
    <motion.main
      className="gate"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}
    >
      <header className="gate__hero">
        <div className="gate__heralds" aria-hidden="true">
          {HERALDS.map((s, i) => (
            <StatusIcon key={s} status={s} animated={!reduce} phase={i * 0.4} size={72} />
          ))}
        </div>
        <h1 className="title">
          <span className="title__en">Dependency Graveyard</span>
          <span className="title__sub">{t.gate.tagline}</span>
        </h1>
        <p className="gate__lede">
          {t.gate.lede[0]}
          <code>package.json</code>
          {t.gate.lede[1]}
        </p>
      </header>

      <form
        className={`ledger-book${dragging ? " ledger-book--drag" : ""}`}
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void readFile(e.dataTransfer.files[0]);
        }}
      >
        <label htmlFor="manifest" className="ledger-book__label">
          <BookOpen size={18} aria-hidden="true" /> {t.gate.label}
        </label>
        <textarea
          id="manifest"
          className="ledger-book__input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={'{\n  "dependencies": {\n    "react": "^19.0.0"\n  }\n}'}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={failure ? true : undefined}
          aria-describedby={failure ? "manifest-error" : "manifest-hint"}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(draft);
          }}
        />
        {failure ? (
          <motion.p
            id="manifest-error"
            role="alert"
            className="ink-note"
            initial={{ opacity: 0, rotate: -2, y: -4 }}
            animate={{ opacity: 1, rotate: -1, y: 0 }}
          >
            {t.gate.errors[failure.code](failure.field)}
            {failure.line ? t.gate.errorAt(failure.line, failure.column) : null}
          </motion.p>
        ) : (
          <p id="manifest-hint" className="ledger-book__hint">
            {t.gate.hint}
          </p>
        )}

        <fieldset className="ledger-book__options">
          <legend className="sr-only">{t.gate.kindsLegend}</legend>
          <span className="ledger-book__fixed">{t.gate.fixed}</span>
          <label>
            <input type="checkbox" checked={includePeer} onChange={(e) => setIncludePeer(e.target.checked)} /> peerDependencies
          </label>
          <label>
            <input type="checkbox" checked={includeOptional} onChange={(e) => setIncludeOptional(e.target.checked)} />{" "}
            optionalDependencies
          </label>
        </fieldset>

        <div className="ledger-book__actions">
          <button type="submit" className="btn btn--primary">
            <Sparkles size={18} aria-hidden="true" /> {t.gate.summon}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setDraft(SAMPLE_PACKAGE_JSON);
              submit(SAMPLE_PACKAGE_JSON);
            }}
          >
            {t.gate.sample}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={18} aria-hidden="true" /> {t.gate.file}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => {
              void readFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </form>
    </motion.main>
  );
}
