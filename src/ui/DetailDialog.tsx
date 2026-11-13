import * as Dialog from "@radix-ui/react-dialog";
import { ExternalLink, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { usePackageInfo } from "@/data/packageInfo";
import { npmPageUrl } from "@/data/links";
import { isoDay } from "@/domain/format";
import type { Grave } from "@/domain/types";
import { StatusIcon } from "@/graves/icons/StatusIcon";
import { translator, useT } from "@/i18n";
import { useReduce } from "@/store/useReduce";

interface Props {
  grave: Grave | null;
  now: number;
  onClose: () => void;
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="fact">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Body({ grave, now }: { grave: Grave; now: number }) {
  const reduce = useReduce();
  const T = useT();
  const { t } = T;
  const { spec, status, history, weeklyDownloads } = grave;
  const label = t.status[status].label;
  // The seal pairs the label with its name in the other language.
  const altLabel = translator(T.locale === "en" ? "zh" : "en").t.status[status].label;
  const info = usePackageInfo(spec.target);
  const gx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const gy = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const epitaph = T.epitaph(grave, now);
  const showLastWords = history?.deprecated !== undefined && !(history.deprecated && epitaph.includes(history.deprecated));

  return (
    <div
      className="scroll"
      onPointerMove={(e) => {
        if (status !== "ghost" || reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        gx.set(((e.clientX - r.left) / r.width - 0.5) * 4);
        gy.set(((e.clientY - r.top) / r.height - 0.3) * 3);
      }}
    >
      <div className="scroll__head">
        <motion.div layoutId={`icon-${spec.id}`} className="scroll__icon">
          <StatusIcon
            status={status}
            animated={!reduce}
            size="100%"
            title={label}
            gaze={status === "ghost" ? { x: gx, y: gy } : undefined}
          />
        </motion.div>
        <div>
          <p className={`scroll__seal scroll__seal--${status}`}>
            {label} · <span lang={T.locale === "en" ? "zh-CN" : "en"}>{altLabel}</span>
          </p>
          <Dialog.Title className="scroll__title">{spec.name}</Dialog.Title>
          {spec.target && spec.target !== spec.name ? <p className="scroll__alias">{t.dialog.alias(spec.target)}</p> : null}
          <p className="scroll__range">
            {t.dialog.declared} <code>{spec.range}</code> · {t.kind[spec.kind]}
          </p>
        </div>
      </div>

      <Dialog.Description className="scroll__epitaph">{epitaph}</Dialog.Description>
      <p className="scroll__reason">
        {t.dialog.reasonPrefix}
        {T.reason(grave, now)}
      </p>

      <dl className="facts">
        <Fact label={t.dialog.last}>
          {history?.lastPublishedAt ? (
            <>
              {isoDay(history.lastPublishedAt)}
              <small>
                {T.relative(history.lastPublishedAt, now)}
                {history.source === "npm" ? t.dialog.fromNpm : ""}
              </small>
            </>
          ) : (
            t.unknown
          )}
        </Fact>
        <Fact label={t.dialog.latest}>{history?.latestVersion ?? t.unknown}</Fact>
        <Fact label={t.dialog.downloads}>{weeklyDownloads != null ? T.number(weeklyDownloads) : t.unknown}</Fact>
        <Fact label={t.dialog.versions}>{history ? T.number(history.versionCount) : t.unknown}</Fact>
        {history?.firstPublishedAt ? <Fact label={t.dialog.first}>{isoDay(history.firstPublishedAt)}</Fact> : null}
        {info.data?.license ? <Fact label={t.dialog.license}>{info.data.license}</Fact> : null}
        {info.data?.stars != null ? <Fact label={t.dialog.stars}>{T.number(info.data.stars)}</Fact> : null}
      </dl>

      {showLastWords ? (
        <blockquote className="scroll__last-words">
          <span>{t.dialog.lastWords}</span>
          {history?.deprecated || t.dialog.noWords}
        </blockquote>
      ) : null}

      {info.data?.description ? <p className="scroll__desc">{info.data.description}</p> : null}

      {spec.target ? (
        <div className="scroll__links">
          <a href={npmPageUrl(spec.target)} target="_blank" rel="noopener noreferrer">
            {t.dialog.npm} <ExternalLink size={14} aria-hidden="true" />
          </a>
          {info.data?.repository ? (
            <a href={info.data.repository} target="_blank" rel="noopener noreferrer">
              {t.dialog.repo} <ExternalLink size={14} aria-hidden="true" />
            </a>
          ) : null}
          {info.data?.homepage && info.data.homepage !== info.data.repository ? (
            <a href={info.data.homepage} target="_blank" rel="noopener noreferrer">
              {t.dialog.home} <ExternalLink size={14} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      ) : null}

      <p className="scroll__note">{t.dialog.note}</p>
    </div>
  );
}

export function DetailDialog({ grave, now, onClose }: Props) {
  const { t } = useT();
  return (
    <Dialog.Root open={!!grave} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {grave ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                className={`dialog dialog--${grave.status}`}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                <Body grave={grave} now={now} />
                <Dialog.Close className="dialog__close" aria-label={t.dialog.close}>
                  <X size={20} aria-hidden="true" />
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
