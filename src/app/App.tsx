import { AnimatePresence, MotionConfig } from "motion/react";
import { Languages, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useT } from "@/i18n";
import { Scene } from "@/scene/Scene";
import { useStore } from "@/store/useStore";
import { Gate } from "@/ui/Gate";
import { Graveyard } from "./Graveyard";

const HTML_LANG = { en: "en", zh: "zh-CN" } as const;

export function App() {
  const { summons, leave, motionOff, toggleMotion, locale, setLocale } = useStore();
  const { t } = useT();

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  return (
    <MotionConfig reducedMotion={motionOff ? "always" : "user"}>
      <div className={`app${motionOff ? " motion-off" : ""}`}>
        <Scene />
        <a className="skip-link" href="#content">
          {t.skip}
        </a>
        <nav className="topbar" aria-label={t.nav.label}>
          <button type="button" className="topbar__brand" onClick={leave} disabled={!summons}>
            <img src="/favicon.svg" alt="" width={28} height={28} />
            <span>Dependency Graveyard</span>
          </button>
          <div className="topbar__actions">
            {summons ? (
              <button type="button" className="btn btn--small" onClick={leave}>
                <RotateCcw size={16} aria-hidden="true" /> {t.nav.resummon}
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn--small btn--ghost"
              onClick={toggleMotion}
              aria-label={motionOff ? t.nav.motionOn : t.nav.motionOff}
            >
              {motionOff ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              <span className="topbar__text" aria-hidden="true">
                {motionOff ? t.nav.motionOn : t.nav.motionOff}
              </span>
            </button>
            <button
              type="button"
              className="btn btn--small btn--ghost"
              onClick={() => setLocale(locale === "en" ? "zh" : "en")}
              aria-label={t.nav.language}
            >
              <Languages size={16} aria-hidden="true" />
              <span lang={locale === "en" ? "zh-CN" : "en"}>{t.switchTo}</span>
            </button>
          </div>
        </nav>
        <div id="content" className="content">
          <AnimatePresence mode="wait">
            {summons ? <Graveyard key={summons.now} summons={summons} /> : <Gate key="gate" />}
          </AnimatePresence>
        </div>
        <footer className="footer">
          <p>
            {t.footer.disclaimerA}
            <strong>{t.footer.disclaimerStrong}</strong>
            {t.footer.disclaimerB}
          </p>
          <p>
            {t.footer.dataA}
            <a href="https://deps.dev" target="_blank" rel="noopener noreferrer">
              deps.dev
            </a>
            {t.footer.and}
            <a href="https://www.npmjs.com" target="_blank" rel="noopener noreferrer">
              npm
            </a>
            {t.footer.dataB}
          </p>
        </footer>
      </div>
    </MotionConfig>
  );
}
