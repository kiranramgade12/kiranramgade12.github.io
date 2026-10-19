import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import './portfolio-tour.css';

const guideImage = new URL('../images/kiran-guide-waist-up.png', import.meta.url).href;
export type TourStep = { target: string; title: string; text: string; chapter: string; highlightIndex?: number };

export function TourIntro({ onStart }: { onStart: () => void }) {
  const reduce = useReducedMotion();
  return <div className="guide-intro">
    <div className="guide-intro-orbit" aria-hidden="true" />
    <span className="guide-intro-label">YOUR PERSONAL PORTFOLIO GUIDE</span>
    <motion.img className="guide-intro-avatar" src={guideImage} width={1199} height={1312} fetchPriority="high"
      alt="Kiran's waist-up avatar holding a presentation pointer"
      animate={reduce ? {} : { y: [0, -9, 0], rotate: [0, .7, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
    <div className="guide-invitation"><p>Hi, I'm Kiran.<br/><strong>Let me show you around.</strong></p>
      <button className="button primary" onClick={onStart}><Play size={17} fill="currentColor"/> Start guided tour <ArrowRight size={17}/></button>
      <small>Follow my pointer through the portfolio.<br/>Pause, skip or explore at your own pace.</small>
    </div>
  </div>;
}

type Box = { x: number; y: number; width: number; height: number };
type Point = { x: number; y: number };
const emptyBox: Box = { x: 0, y: 0, width: 0, height: 0 };

export function PortfolioTour({ steps, onClose, onHighlightChange }: {
  steps: TourStep[]; onClose: () => void; onHighlightChange: (index: number) => void;
}) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(Boolean(reduce));
  const [progress, setProgress] = useState(0);
  const [box, setBox] = useState<Box>(emptyBox);
  const [pointer, setPointer] = useState<{ from: Point; to: Point } | null>(null);
  const [dockLeft, setDockLeft] = useState(16);
  const [onLeft, setOnLeft] = useState(false);
  const [targetMissing, setTargetMissing] = useState(false);
  const dockRef = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const elapsed = useRef(0);
  const measureRef = useRef<() => void>(() => {});
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const current = steps[step];
  const duration = Math.max(9000, current.text.split(/\s+/).length * 250 + 3000);
  const last = step === steps.length - 1;

  const go = useCallback((direction: number) => {
    setStep(value => Math.max(0, Math.min(steps.length - 1, value + direction)));
  }, [steps.length]);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add('portfolio-tour-open');
    playRef.current?.focus({ preventScroll: true });
    const pause = () => setPaused(true);
    const hidden = () => { if (document.hidden) pause(); };
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); return; }
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
    };
    const interact = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest('.tour-dock')) pause();
    };
    window.addEventListener('keydown', keys);
    window.addEventListener('wheel', pause, { passive: true });
    window.addEventListener('touchmove', pause, { passive: true });
    window.addEventListener('pointerdown', interact);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      document.documentElement.classList.remove('portfolio-tour-open');
      window.removeEventListener('keydown', keys);
      window.removeEventListener('wheel', pause);
      window.removeEventListener('touchmove', pause);
      window.removeEventListener('pointerdown', interact);
      document.removeEventListener('visibilitychange', hidden);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [go]);

  useEffect(() => {
    elapsed.current = 0;
    setProgress(0);
    if (current.highlightIndex !== undefined) onHighlightChange(current.highlightIndex);
    const target = document.querySelector<HTMLElement>(current.target);
    setTargetMissing(!target);
    if (!target) { setPaused(true); setBox(emptyBox); setPointer(null); return; }
    let frame = 0;
    let scrollFrame = 0;
    const measure = () => {
      const rect = target.getBoundingClientRect();
      const dock = dockRef.current?.getBoundingClientRect();
      const avatar = avatarRef.current?.getBoundingClientRect();
      const small = window.innerWidth < 700;
      const leftSide = !small && rect.left + rect.width / 2 >= window.innerWidth / 2;
      setOnLeft(leftSide);
      setDockLeft(small || leftSide ? 12 : Math.max(12, window.innerWidth - (dock?.width || 500) - 16));
      setBox({ x: rect.left - 7, y: rect.top - 7, width: rect.width + 14, height: rect.height + 14 });
      if (avatar) {
        // Connect the animated pointer to the tip of the stylus in the avatar sprite.
        const from = { x: avatar.left + avatar.width * (leftSide ? .975 : .025), y: avatar.top + avatar.height * .383 };
        const to = { x: Math.max(rect.left + 14, Math.min(rect.right - 14, from.x)), y: rect.bottom + 7 };
        if (rect.top > from.y) to.y = rect.top - 7;
        else if (rect.bottom > from.y) {
          to.x = from.x < rect.left + rect.width / 2 ? rect.left - 7 : rect.right + 7;
          to.y = Math.max(rect.top + 14, Math.min(rect.bottom - 14, from.y));
        }
        setPointer({ from, to });
      }
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    measureRef.current = schedule;
    const scrollToTarget = () => {
      const rect = target.getBoundingClientRect();
      const dockHeight = dockRef.current?.getBoundingClientRect().height || 240;
      const available = window.innerHeight - dockHeight - 55;
      const topGap = Math.max(28, (available - rect.height) / 2);
      window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - topGap), behavior: reduce ? 'instant' : 'smooth' });
      schedule();
    };
    scrollFrame = requestAnimationFrame(scrollToTarget);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', scrollToTarget);
    const observer = new ResizeObserver(schedule);
    observer.observe(target);
    if (dockRef.current) observer.observe(dockRef.current);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', scrollToTarget);
      measureRef.current = () => {};
    };
  }, [step, current, onHighlightChange, reduce]);

  useEffect(() => {
    if (paused || targetMissing) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      elapsed.current += now - previous;
      previous = now;
      setProgress(Math.min(1, elapsed.current / duration));
      if (elapsed.current >= duration) {
        clearInterval(timer);
        if (last) setPaused(true);
        else go(1);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [paused, step, duration, last, go, targetMissing]);

  return <>
    {box.width > 0 && <div className="tour-spotlight" aria-hidden="true" style={{ left: box.x, top: box.y, width: box.width, height: box.height }}/ >}
    {pointer && <svg className="tour-pointer" aria-hidden="true">
      <defs><linearGradient id="tour-wand" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#c6b6ff"/><stop offset="1" stopColor="#73e2e9"/></linearGradient></defs>
      <line x1={pointer.from.x} y1={pointer.from.y} x2={pointer.to.x} y2={pointer.to.y} stroke="url(#tour-wand)" strokeWidth="3" strokeLinecap="round"/>
      <circle className="tour-pointer-dot" cx={pointer.to.x} cy={pointer.to.y} r="6" fill="#73e2e9"/>
    </svg>}
    <motion.aside ref={dockRef} className={`tour-dock${onLeft ? ' tour-dock-left' : ''}`} role="region" aria-label="Guided portfolio tour"
      initial={{ opacity: 0 }} animate={{ opacity: 1, x: dockLeft }} onUpdate={() => measureRef.current()}
      transition={reduce ? { duration: 0 } : { x: { type: 'spring', stiffness: 85, damping: 20 }, opacity: { duration: .3 } }}>
      <div className="tour-avatar-wrap"><motion.img ref={avatarRef} key={step} src={guideImage} width={1199} height={1312} alt="Kiran's animated guide"
        className="tour-avatar" initial={false} animate={reduce ? {} : { y: [0, -8, 0] }}
        transition={{ duration: .85, ease: 'easeInOut' }} onUpdate={() => measureRef.current()}/></div>
      <div className="tour-bubble">
        <div className="tour-meta"><span>{current.chapter} · {step + 1}/{steps.length}</span><button onClick={onClose} aria-label="Skip and close tour"><X size={17}/></button></div>
        <div aria-live="polite" aria-atomic="true"><h3>{current.title}</h3><p>{targetMissing ? 'This item is currently hidden. Use Next to continue exploring.' : current.text}</p></div>
        <div className="tour-progress" aria-hidden="true"><span style={{ width: `${progress * 100}%` }}/></div>
        <div className="tour-controls"><button onClick={() => go(-1)} disabled={step === 0} aria-label="Previous tour stop"><ChevronLeft size={18}/></button>
          <button ref={playRef} className="tour-play" onClick={() => { if (last && progress >= 1) elapsed.current = 0; setPaused(value => !value); }} aria-label={paused ? 'Play tour' : 'Pause tour'}>
            {paused ? <Play size={15}/> : <Pause size={15}/>} {paused ? 'Play' : 'Pause'}</button>
          <button onClick={() => last ? onClose() : go(1)} aria-label={last ? 'Finish tour' : 'Next tour stop'}>{last ? 'Finish' : 'Next'}<ChevronRight size={17}/></button>
        </div>
        <span className="tour-hint">{paused ? 'Paused — explore freely, then press Play.' : 'Auto-playing · scroll to pause · Esc to exit'}</span>
      </div>
    </motion.aside>
  </>;
}
