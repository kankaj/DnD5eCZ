import { useEffect, useMemo, useRef } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import { MonsterStatBlock } from "./MonsterStatBlock";
import type { MonsterStatBlockProps } from "./MonsterStatBlock";

interface MarkdownRendererProps {
  content: string;
  searchQuery?: string;
}

function parseMonsterProps(match: RegExpMatchArray): Record<string, string> {
  const props: Record<string, string> = {};
  const propsStr = match[1];
  const propRegex = /(\w+(?:-\w+)*)="([^"]*)"/g;
  let propMatch;
  while ((propMatch = propRegex.exec(propsStr)) !== null) {
    props[propMatch[1]] = propMatch[2];
  }
  return props;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function findOriginalMatchRange(text: string, query: string): { start: number; end: number } | null {
  const normalizedChars: string[] = [];
  const originalIndexes: number[] = [];

  Array.from(text).forEach((char, index) => {
    const normalizedChar = normalizeSearchText(char);
    for (const normalizedPart of normalizedChar) {
      normalizedChars.push(normalizedPart);
      originalIndexes.push(index);
    }
  });

  const matchIndex = normalizedChars.join("").indexOf(query);
  if (matchIndex === -1) return null;

  const start = originalIndexes[matchIndex];
  const end = originalIndexes[matchIndex + query.length - 1] + 1;

  return { start, end };
}

function clearSearchMarks(root: HTMLElement) {
  root.querySelectorAll("mark[data-search-match]").forEach((mark) => {
    mark.replaceWith(document.createTextNode(mark.textContent ?? ""));
  });
  root.normalize();
}

function markFirstSearchMatch(root: HTMLElement, query: string): HTMLElement | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    const textNode = node as Text;
    const text = textNode.textContent ?? "";
    const parent = textNode.parentElement;
    const range = findOriginalMatchRange(text, query);

    if (parent && range && !parent.closest("mark[data-search-match]")) {
      const before = document.createTextNode(text.slice(0, range.start));
      const match = document.createElement("mark");
      const after = document.createTextNode(text.slice(range.end));

      match.dataset.searchMatch = "true";
      match.textContent = text.slice(range.start, range.end);
      textNode.replaceWith(before, match, after);

      return match;
    }

    node = walker.nextNode();
  }

  return null;
}

export function MarkdownRenderer({ content, searchQuery }: MarkdownRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { html, monsters } = useMemo(() => {
    const monsterMatches: Array<{ id: number; props: Record<string, string> }> = [];
    let processedContent = content;
    let monsterId = 0;

    const monsterRegex = /<Monster\s+([^>]+)\/>/g;
    let match;
    while ((match = monsterRegex.exec(content)) !== null) {
      const props = parseMonsterProps(match);
      monsterMatches.push({ id: monsterId, props });
      processedContent = processedContent.replace(
        match[0],
        `<div data-monster-id="${monsterId}"></div>`
      );
      monsterId++;
    }

    const result = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify)
      .processSync(processedContent);

    return { html: String(result), monsters: monsterMatches };
  }, [content]);

  const parts = html.split(/<div data-monster-id="(\d+)"><\/div>/);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    clearSearchMarks(root);

    const normalizedQuery = normalizeSearchText(searchQuery?.trim() ?? "");
    if (!normalizedQuery) return;

    const match = markFirstSearchMatch(root, normalizedQuery);
    match?.scrollIntoView({ block: "center" });
  }, [html, searchQuery]);

  return (
    <div ref={contentRef} className="markdown-content max-w-none p-4 text-sm leading-relaxed text-foreground">
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          const monsterId = parseInt(part);
          const monster = monsters.find((m) => m.id === monsterId);
          if (monster) {
            return <MonsterStatBlock key={monsterId} {...(monster.props as unknown as MonsterStatBlockProps)} />;
          }
          return null;
        }
        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: part }}
          />
        );
      })}
    </div>
  );
}
