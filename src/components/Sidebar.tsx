import React, { useLayoutEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { findProblem, searchCatalog, TIER_NAMES } from '../catalog';
import type { Category, CategoryId } from '../engine/model';
import { problemHref } from '../route';

interface SidebarProps {
  currentId: string;
  seen: Set<string>;
  query: string;
  onQueryChange: (query: string) => void;
  choice: ReadonlyMap<CategoryId, boolean>; // 사용자가 직접 펼치거나 접은 유형
  onChoose: (id: CategoryId, open: boolean) => void;
  onPick: () => void; // 문제를 골랐을 때(서랍이면 닫는다)
}

const TIERS = [1, 2, 3, 4] as const;

// 문제 화면 왼쪽 목록(catalog.html 시안 B안): 빈도 단계 → 유형(펼치기/접기) → 문제.
// 지금 문제의 유형은 펼쳐 두고, 사용자가 직접 펼치거나 접은 유형은 그 선택을 따른다. 검색 중에는 맞는 유형을 모두 펼친다.
// 검색어와 펼침 선택은 ProblemPage가 쥔다(이 목록이 접혔다 펴지거나 서랍과 왼쪽 칸을 오가며 새로 만들어져도 남도록).
// 다른 문제로 가면 그 문제의 유형은 전에 접었더라도 다시 펼친다(그 정리도 ProblemPage가 한다).
export const Sidebar: React.FC<SidebarProps> = ({ currentId, seen, query, onQueryChange, choice, onChoose, onPick }) => {
  const currentRef = useRef<HTMLAnchorElement>(null);
  const current = findProblem(currentId)?.category.id;
  const q = query.trim();
  const groups = searchCatalog(q);
  const isOpen = (c: Category) => q !== '' || (choice.get(c.id) ?? c.id === current);

  // 지금 문제가 목록 칸 안에 보이게 한다(닫힌 서랍 안이면 아무 일도 없고, 서랍은 열 때 지금 문제에 초점을 둔다)
  useLayoutEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'nearest' });
  }, [currentId]);

  return (
    <nav className="sidebar" aria-label="문제 목록">
      <input
        type="search"
        className="search-input"
        placeholder="문제 찾기"
        aria-label="문제 찾기"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      {TIERS.map((tier) => {
        const cats = groups.filter((g) => g.category.tier === tier);
        if (!cats.length) return null;
        return (
          <div key={tier} className="side-tier">
            <p className="side-tier-label">{TIER_NAMES[tier]}</p>
            <ul className="side-cats">
              {cats.map(({ category, problems }) => {
                const open = isOpen(category);
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      className="side-cat"
                      aria-expanded={open}
                      onClick={() => onChoose(category.id, !open)}
                    >
                      <ChevronRight size={15} className="side-chev" aria-hidden="true" />
                      {category.name}
                      <span className="side-n">{category.problems.length}</span>
                    </button>
                    {open && (
                      <ul className="side-list">
                        {problems.map((p) => (
                          <li key={p.id}>
                            {p.load ? (
                              <a
                                href={problemHref(p.id)}
                                className="side-p"
                                aria-current={p.id === currentId ? 'page' : undefined}
                                ref={p.id === currentId ? currentRef : undefined}
                                onClick={onPick}
                              >
                                <span className={`level-chip lv-${p.level}`}>Lv.{p.level}</span>
                                <span className="side-p-title">{p.title}</span>
                                {seen.has(p.id) && (
                                  <span className="seen-mark" role="img" aria-label="봤음">
                                    ✓
                                  </span>
                                )}
                              </a>
                            ) : (
                              // 준비 중: 누를 수 없는 글자로만 둔다
                              <span className="side-p is-soon" aria-disabled="true">
                                <span className={`level-chip lv-${p.level}`}>Lv.{p.level}</span>
                                <span className="side-p-title">{p.title}</span>
                                <span className="sr-only">준비 중</span>
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {/* 화면 읽기 프로그램이 바뀐 글을 읽도록 알림 자리는 늘 둔다 */}
      <p className="side-empty" role="status">
        {!groups.length && <>&lsquo;{q}&rsquo;에 맞는 문제가 없습니다.</>}
      </p>
    </nav>
  );
};
