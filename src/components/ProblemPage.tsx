import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { ChevronRight, ExternalLink, RotateCcw, X } from 'lucide-react';
import { findProblem, TIER_NAMES } from '../catalog';
import type { CategoryId, Language, Problem, ProblemMeta } from '../engine/model';
import { progress } from '../progress';
import { problemHref } from '../route';
import { ApproachNotes } from './ApproachNotes';
import { ApproachTabs } from './ApproachTabs';
import { CodePanel } from './CodePanel';
import { CompareBars } from './CompareBars';
import { layoutStore, useLayoutSizes } from '../layoutStore';
import { Player } from './Player';
import { RaceView } from './RaceView';
import { ColResizer, ResizeHandle } from './ResizeHandle';
import { Sidebar } from './Sidebar';

type Variables = Record<string, string | number>;

const NO_VARIABLES: Variables = {};

// 1280px 이상은 옆 메뉴가 왼쪽 칸(접을 수 있음), 그보다 좁으면 '☰ 문제 목록'으로 여는 서랍
const WIDE = window.matchMedia('(min-width: 1280px)');
const watchWide = (onChange: () => void) => {
  WIDE.addEventListener('change', onChange);
  return () => WIDE.removeEventListener('change', onChange);
};
const isWide = () => WIDE.matches;

// 정석 풀이를 끝까지 보면 색종이를 뿌린다. 색은 index.css 맨 위 토큰에서 읽는다
const celebrate = () => {
  const css = getComputedStyle(document.documentElement);
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['--hl-yellow', '--hl-pink', '--hl-blue', '--pen'].map((token) => css.getPropertyValue(token).trim()),
    disableForReducedMotion: true,
  });
};

// 없는 문제, 준비 중인 문제의 안내(불러오지 못한 문제는 본문 자리에서 알린다)
const Notice: React.FC<{ text: string }> = ({ text }) => (
  <main className="solo-page">
    <p role="alert">{text}</p>
    <a href="#/">홈으로</a>
  </main>
);

// 본문 자리의 실패 안내: 문제를 불러오지 못했거나, 그리거나 시각화를 만들다 오류가 났을 때
const Failed: React.FC<{ meta: ProblemMeta; text: string }> = ({ meta, text }) => (
  <div className="problem-main">
    <ProblemHead meta={meta} />
    <p role="alert">{text}</p>
    <a href="#/">홈으로</a>
  </div>
);

// 본문에서 난 오류가 앱 전체를 비우지 않게 본문 자리에서만 알린다(옆 메뉴와 머리줄은 그대로). 문제가 바뀌면 key로 새로 시작한다
class BodyBoundary extends React.Component<{ meta: ProblemMeta; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <Failed meta={this.props.meta} text="문제를 보여 주지 못했습니다." /> : this.props.children;
  }
}

// 좁은 화면의 옆 메뉴. 네이티브 <dialog>가 포커스 가두기, Esc 닫기, 배경 처리를 맡는다(GuideModal과 같은 방식)
const Drawer: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>('[aria-current="page"]')?.focus(); // 지금 문제가 보이게
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby="drawer-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer-head">
        <h2 id="drawer-title">문제 목록</h2>
        <button type="button" className="icon-btn is-ghost" onClick={onClose} aria-label="닫기">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      {children}
    </dialog>
  );
};

// 같은 유형 안의 이전/다음 문제. 없거나 준비 중이면 누를 수 없다
const PagerButton: React.FC<{ to?: ProblemMeta; label: string }> = ({ to, label }) => (
  <button
    type="button"
    className="btn-outline head-btn"
    disabled={!to?.load}
    title={to?.title}
    onClick={() => {
      if (to) window.location.hash = problemHref(to.id);
    }}
  >
    {label}
  </button>
);

// 문제 화면: 옆 메뉴 | 가운데(제목 → 문제 보기 → 풀이 탭 → 재생 또는 나란히 비교 → 평가 → 비교 막대) | 코드 칸.
export const ProblemPage: React.FC<{ id: string; tools: HTMLElement | null }> = ({ id, tools }) => {
  const wide = useSyncExternalStore(watchWide, isWide);
  const sizes = useLayoutSizes();
  const [collapsed, setCollapsed] = useState(false); // 넓은 화면에서 옆 메뉴를 접었는지
  const [drawerOpen, setDrawerOpen] = useState(false);
  if (wide && drawerOpen) setDrawerOpen(false);
  const [seen, setSeen] = useState(() => progress.seen());
  const [query, setQuery] = useState('');
  const [choice, setChoice] = useState<ReadonlyMap<CategoryId, boolean>>(new Map());
  const [shownId, setShownId] = useState(id);
  const found = findProblem(id);

  if (shownId !== id) {
    setShownId(id);
    if (found) setChoice((m) => new Map([...m].filter(([categoryId]) => categoryId !== found.category.id)));
  }

  // 전체 스크롤 모드면 .app.is-problem의 100dvh 고정을 풀 수 있도록 클래스를 동기화한다
  useEffect(() => {
    const app = document.querySelector('.app');
    app?.classList.toggle('is-free-scroll', sizes.freeScroll);
    return () => app?.classList.remove('is-free-scroll');
  }, [sizes.freeScroll]);

  if (!found) return <Notice text="문제를 찾을 수 없습니다." />;
  const { category, meta, index } = found;
  if (!meta.load) return <Notice text="아직 준비 중인 문제입니다." />;

  const listShown = wide ? !collapsed : drawerOpen;
  const hasCustom = layoutStore.hasCustomSizes(sizes);
  const sidebar = (
    <Sidebar
      currentId={id}
      seen={seen}
      query={query}
      onQueryChange={setQuery}
      choice={choice}
      onChoose={(categoryId, open) => setChoice((m) => new Map(m).set(categoryId, open))}
      onPick={() => setDrawerOpen(false)}
    />
  );

  const pageClass = [
    'problem-page',
    wide && !collapsed ? 'has-sidebar' : '',
    sizes.freeScroll ? 'is-free-scroll' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <main
      className={pageClass}
      style={{ '--sidebar-w': `${sizes.sidebarW}px`, '--code-w': `${sizes.codeW}px` } as React.CSSProperties}
    >
      {tools &&
        createPortal(
          <div className="crumbs-row">
            <button
              type="button"
              className="btn-outline head-btn list-toggle"
              aria-expanded={listShown}
              onClick={() => (wide ? setCollapsed(!collapsed) : setDrawerOpen(true))}
            >
              <span aria-hidden="true">☰</span> 문제 목록
            </button>
            <p className="crumbs">
              {TIER_NAMES[category.tier]} › {category.name} › {index + 1}/{category.problems.length}
            </p>
            <div className="pager">
              <button
                type="button"
                className="btn-outline head-btn"
                aria-pressed={sizes.freeScroll}
                onClick={() => layoutStore.setFreeScroll(!sizes.freeScroll)}
                title="칸마다 따로 스크롤할지, 페이지 전체를 길게 펼쳐 스크롤할지 전환합니다"
              >
                {sizes.freeScroll ? '전체 스크롤 켜짐' : '전체 스크롤'}
              </button>
              {hasCustom && (
                <button
                  type="button"
                  className="btn-outline head-btn"
                  onClick={() => layoutStore.resetAll()}
                  title="조절한 모든 컴포넌트 크기와 폭·배율을 기본값으로 되돌립니다"
                >
                  <RotateCcw size={13} aria-hidden="true" /> 크기 초기화
                </button>
              )}
              <PagerButton to={category.problems[index - 1]} label="← 이전 문제" />
              <PagerButton to={category.problems[index + 1]} label="다음 문제 →" />
            </div>
          </div>,
          tools,
        )}

      {wide ? (
        !collapsed && (
          <>
            {sidebar}
            <ColResizer kind="sidebar" label="문제 목록" />
          </>
        )
      ) : (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {sidebar}
        </Drawer>
      )}

      <BodyBoundary key={id} meta={meta}>
        <ProblemBody meta={meta} load={meta.load} onSeen={() => setSeen(progress.seen())} />
      </BodyBoundary>
    </main>
  );
};

// 제목, 레벨, 원문 링크. 문제 본문을 불러오기 전에도 목록 정보로 그린다
const ProblemHead: React.FC<{ meta: ProblemMeta }> = ({ meta }) => (
  <header className="problem-head">
    <h1 className="problem-title">{meta.title}</h1>
    <span className={`level-chip lv-${meta.level}`}>Lv.{meta.level}</span>
    <a className="source-link" href={meta.sourceUrl} target="_blank" rel="noreferrer">
      프로그래머스에서 원문 보기
      <ExternalLink size={14} aria-hidden="true" />
    </a>
  </header>
);

// 문제 본문(가운데 칸과 코드 칸). 문제를 불러오고, 정석 풀이를 끝까지 보면 '봤음'으로 적는다
const ProblemBody: React.FC<{ meta: ProblemMeta; load: () => Promise<Problem>; onSeen: () => void }> = ({ meta, load, onSeen }) => {
  const { id } = meta;
  const [problem, setProblem] = useState<Problem>();
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0); // 고른 풀이 번호
  const [comparing, setComparing] = useState(false);
  const [language, setLanguage] = useState<Language>('python');
  const [lines, setLines] = useState<Record<Language, number[]> | null>(null);
  const [vars, setVars] = useState<{ now: Variables; prev?: Variables }>({ now: NO_VARIABLES });
  const detailsBodyRef = useRef<HTMLDivElement>(null);
  const sizes = useLayoutSizes();
  const customDetailsH = sizes.heights.details;

  useEffect(() => {
    let alive = true;
    load().then(
      (p) => {
        if (!alive) return;
        setProblem(p);
        progress.setLast(id);
      },
      () => {
        if (alive) setFailed(true);
      },
    );
    return () => {
      alive = false;
    };
  }, [id, load]);

  const vizs = useMemo(() => problem?.approaches.map((a) => a.visualize()), [problem]);

  if (failed) return <Failed meta={meta} text="문제를 불러오지 못했습니다." />;
  if (!problem || !vizs) {
    return (
      <div className="problem-main">
        <ProblemHead meta={meta} />
        <p>불러오는 중</p>
      </div>
    );
  }

  const approach = problem.approaches[active];
  const { description } = problem;
  const showVariables = (now: Variables) => setVars((v) => (v.now === now ? v : { now, prev: v.now }));
  const clearReadout = () => {
    setLines(null);
    setVars({ now: NO_VARIABLES });
  };
  const finish = () => {
    progress.markSeen(id);
    onSeen();
    celebrate();
  };

  return (
    <>
      <div className="problem-main">
        <ProblemHead meta={meta} />
        <details className="problem-details">
          <summary>
            <ChevronRight size={16} className="details-chevron" aria-hidden="true" />
            문제 보기
          </summary>
          <div className="panel problem-details-card">
            <div
              ref={detailsBodyRef}
              className="problem-details-body"
              style={customDetailsH !== undefined ? { height: customDetailsH, overflowY: 'auto' } : undefined}
            >
              <p className="problem-summary">{description.summary}</p>
              <section className="panel-section">
                <h2 className="section-title">제한 사항</h2>
                <ul className="rule-list">
                  {description.rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </section>
              <section className="panel-section">
                <h2 className="section-title">입출력 예</h2>
                <table className="io-table">
                  <thead>
                    <tr>
                      <th scope="col">입력</th>
                      <th scope="col">출력</th>
                    </tr>
                  </thead>
                  <tbody>
                    {description.examples.map((example) => (
                      <tr key={example.input}>
                        <td>
                          <code>{example.input}</code>
                        </td>
                        <td>
                          <code className="io-output">{example.output}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <section className="panel-section">
                <h2 className="section-title">핵심 발상</h2>
                <ol className="insight-list">
                  {problem.keyIntuitions.map((text, i) => (
                    <li key={text} className="insight-item">
                      <span className="insight-num" aria-hidden="true">
                        {i + 1}
                      </span>
                      <p>{text}</p>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
            <ResizeHandle id="details" targetRef={detailsBodyRef} label="문제 보기" min={120} max={900} />
          </div>
        </details>

        <ApproachTabs
          approaches={problem.approaches}
          active={active}
          onSelect={(i) => {
            if (i === active) return;
            setActive(i);
            clearReadout();
          }}
          comparing={comparing}
          onToggleCompare={() => {
            setComparing((on) => !on);
            clearReadout();
          }}
        />

        {comparing ? (
          <RaceView problem={problem} vizs={vizs} />
        ) : (
          <Player
            key={approach.id}
            viz={vizs[active]}
            demoLabel={problem.demo.label}
            workUnit={problem.workUnit}
            onFinish={approach.rank === 'BEST' ? finish : undefined}
            onLinesChange={setLines}
            onVariablesChange={showVariables}
          />
        )}

        <ApproachNotes approach={approach} />
        <CompareBars problem={problem} vizs={vizs} active={active} />
      </div>

      <ColResizer kind="code" label="코드와 변수 칸" />

      <CodePanel
        code={approach.code}
        activeLines={comparing ? null : lines}
        variables={comparing ? NO_VARIABLES : vars.now}
        prevVariables={comparing ? undefined : vars.prev}
        complexity={{ time: approach.timeComplexity, space: approach.spaceComplexity }}
        language={language}
        onLanguageChange={setLanguage}
      />
    </>
  );
};
