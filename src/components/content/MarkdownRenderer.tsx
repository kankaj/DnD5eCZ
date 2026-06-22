import { useMemo } from "react";
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

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
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

  return (
    <div className="markdown-content max-w-none p-4 text-sm leading-relaxed text-foreground">
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
