import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GithubSlugger from "github-slugger";

import { NoteReadingExperience, type ReadingHeading } from "@/components/note-reading-experience";
import { getAllArticles, getArticle } from "@/lib/content";

export const dynamicParams = false;
export function generateStaticParams() { return getAllArticles().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = getArticle((await params).slug);
  return article ? { title: article.title, description: article.summary } : { title: "未找到手记" };
}

function extractHeadings(body: string): ReadingHeading[] {
  const slugger = new GithubSlugger();
  return body.split(/\r?\n/).flatMap((line) => {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) return [];
    const text = match[2].replace(/[*_`]/g, "");
    return [{ id: slugger.slug(text), text, level: match[1].length as 2 | 3 }];
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  const all = getAllArticles();
  const headings = extractHeadings(article.body);
  return <NoteReadingExperience article={article} articles={all} headings={headings} />;
}
