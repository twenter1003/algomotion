import React, { useState } from 'react';
import { Keyboard } from 'lucide-react';
import { CATEGORIES, findProblem, searchCatalog, TIER_NAMES } from '../catalog';
import type { CategoryId, ProblemMeta } from '../engine/model';
import { progress } from '../progress';
import { problemHref } from '../route';
import { GuideModal } from './GuideModal';

const TIERS = [1, 2, 3, 4] as const;
const FOLD = 5; // 카드에 처음 보이는 문제 수. 넘으면 '더 보기'로 펼친다

// 문제 줄: 레벨, 제목, 정석 풀이 이름, 봤으면 ✓. 준비 중이면 흐리게 두고 누를 수 없다
const ProblemRow: React.FC<{ meta: ProblemMeta; seen: boolean }> = ({ meta, seen }) => {
  const body = (
    <>
      <span className={`level-chip lv-${meta.level}`}>Lv.{meta.level}</span>
      <span className="prob-title">{meta.title}</span>
      <span className="prob-best">정석 · {meta.bestName}</span>
      {!meta.load ? (
        <span className="soon-tag">준비 중</span>
      ) : (
        seen && (
          <span className="seen-mark" role="img" aria-label="봤음">
            ✓
          </span>
        )
      )}
    </>
  );
  return meta.load ? (
    <a className="prob-row" href={problemHref(meta.id)}>
      {body}
    </a>
  ) : (
    <span className="prob-row is-soon" aria-disabled="true">
      {body}
    </span>
  );
};

// 홈(catalog.html 시안 A안): 출제 빈도 단계 아래 유형 카드. 위에 검색, 이어 보기, 사용법
export const HomePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [unfolded, setUnfolded] = useState<ReadonlySet<CategoryId>>(new Set());
  const [guideOpen, setGuideOpen] = useState(false);
  // 본 문제와 이어 보기는 홈을 열 때 한 번 읽는다(이어 보기는 준비된 문제일 때만)
  const [{ seen, resume }] = useState(() => {
    const last = progress.last();
    const found = last ? findProblem(last) : null;
    return { seen: progress.seen(), resume: found?.meta.load ? found.meta : null };
  });
  const q = query.trim();
  const groups = searchCatalog(q);
  const toggle = (id: CategoryId) =>
    setUnfolded((s) => {
      const next = new Set(s);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <main className="home">
      <h1 className="sr-only">유형별 문제 목록</h1>
      <div className="home-bar">
        <label className="sr-only" htmlFor="home-search">
          문제 찾기
        </label>
        <input
          id="home-search"
          type="search"
          className="search-input home-search"
          placeholder="문제 이름, 유형, 정석 풀이로 찾기"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {resume && (
          <a className="btn-outline resume-link" href={problemHref(resume.id)}>
            이어 보기 · {resume.title} →
          </a>
        )}
        <button type="button" className="btn-outline" onClick={() => setGuideOpen(true)}>
          <Keyboard size={16} aria-hidden="true" />
          사용법
        </button>
      </div>

      {TIERS.map((tier) => {
        const cards = groups.filter((g) => g.category.tier === tier);
        if (!cards.length) return null;
        return (
          <section key={tier} className="tier" data-tier={tier}>
            <div className="tier-head">
              <h2 className="tier-title">
                <span>{TIER_NAMES[tier]}</span>
              </h2>
              <p className="tier-note">유형마다 {CATEGORIES.find((c) => c.tier === tier)!.problems.length}문제</p>
            </div>
            {/* 카드가 한 줄에 혼자 남지 않게 열 수는 카드 수로 나누어떨어지는 것만 쓴다(CSS) */}
            <div className="cat-grid" data-count={cards.length}>
              {cards.map(({ category, problems }) => {
                const total = category.problems.length;
                const seenCount = category.problems.filter((p) => seen.has(p.id)).length;
                const all = q !== '' || unfolded.has(category.id);
                return (
                  <article key={category.id} className="panel cat-card">
                    <div className="cat-top">
                      <h3 className="cat-name">{category.name}</h3>
                      <span className="cat-count">{total}문제</span>
                    </div>
                    <p className="cat-idea">{category.idea}</p>
                    <div className="cat-progress">
                      <span className="cat-track" aria-hidden="true">
                        <span className="cat-fill" style={{ width: `${(seenCount / total) * 100}%` }} />
                      </span>
                      {seenCount}/{total} 봤음
                    </div>
                    <ol className="prob-list">
                      {(all ? problems : problems.slice(0, FOLD)).map((p) => (
                        <li key={p.id}>
                          <ProblemRow meta={p} seen={seen.has(p.id)} />
                        </li>
                      ))}
                    </ol>
                    {q === '' && problems.length > FOLD && (
                      <button type="button" className="more-btn" aria-expanded={all} onClick={() => toggle(category.id)}>
                        {all ? '접기' : `나머지 ${problems.length - FOLD}문제 더 보기`}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
      {/* 화면 읽기 프로그램이 바뀐 글을 읽도록 알림 자리는 늘 둔다 */}
      <p className="home-empty" role="status">
        {!groups.length && <>&lsquo;{q}&rsquo;에 맞는 문제가 없습니다.</>}
      </p>

      <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </main>
  );
};
