import Image from "next/image";
import Link from "next/link";

import { getAllArticles, type Article } from "@/lib/content";

export const metadata = { title: "手记" };

const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function parts(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  const [year, month, day] = value.split("-");
  const full = `${year}年${Number(month)}月${Number(day)}日，${weekdays[date.getUTCDay()]}`;
  return { year, day, month: `${Number(month)}月`, weekday: weekdays[date.getUTCDay()], full, mobile: `${Number(month)}月${Number(day)}日${weekdays[date.getUTCDay()]}` };
}

function Meta({ article }: { article: Article }) {
  return <div className="notes-compact-meta" aria-label={`${article.title}的信息`}>
    {article.topic && <span>{article.topic}</span>}
    {article.weather && <span>{article.weather}</span>}
    {article.mood && <span>{article.mood}</span>}
  </div>;
}

function byYear(articles: Article[]) {
  return articles.reduce<Record<string, Article[]>>((groups, article) => {
    (groups[article.date.slice(0, 4)] ??= []).push(article);
    return groups;
  }, {});
}

function paragraphs(article: Article) {
  const values = article.body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return values.length ? values.slice(0, 3) : [article.summary];
}

export default function NotesPage() {
  const articles = getAllArticles();
  const [featured, ...earlier] = articles;
  const grouped = Object.entries(byYear(earlier)).sort(([a], [b]) => b.localeCompare(a));
  const featuredDate = parts(featured.date);
  const serialBySlug = new Map(articles.map((article, index) => [article.slug, String(articles.length - index).padStart(3, "0")]));

  return <div className="notes-compact-index" data-notes-layout="compact-innei">
      <article className="notes-compact-featured" data-featured-note="compact">
        {featured.cover && <Link className="notes-compact-featured-cover" data-featured-cover="embedded" href={`/notes/${featured.slug}`} aria-label={`阅读《${featured.title}》`} prefetch={false}>
          <Image alt="晨光、窗边与一页打开的书" fill priority sizes="(max-width: 640px) calc(100vw - 32px), 896px" src={featured.cover} />
        </Link>}
        <div className="notes-compact-featured-copy">
          <div className="notes-compact-kicker"><span>LATEST NOTE</span><time dateTime={featured.date}>{featuredDate.full.replace("，", " ")}</time></div>
          <Meta article={featured} />
          <h1><Link prefetch={false} href={`/notes/${featured.slug}`}>{featured.title}</Link></h1>
          <div className="notes-compact-featured-body">{paragraphs(featured).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <footer className="notes-compact-entry-footer"><span>手记 №{serialBySlug.get(featured.slug)}</span><Link prefetch={false} href={`/notes/${featured.slug}`}>阅读全文 →</Link></footer>
        </div>
      </article>

      <section className="notes-compact-archive" aria-labelledby="compact-earlier-notes">
        <header className="notes-compact-archive-heading"><span /><h2 id="compact-earlier-notes">EARLIER NOTES</h2><span /></header>
        {grouped.map(([year, entries]) => <section className="notes-compact-year" key={year} aria-labelledby={`compact-year-${year}`}>
          <header className="notes-compact-year-heading" id={`compact-year-${year}`}><div><span>ANNO</span><strong>{year}</strong></div><span>{entries.length} {entries.length === 1 ? "NOTE" : "NOTES"}</span></header>
          <ol className="notes-compact-timeline">{entries.map((article) => {
            const date = parts(article.date);
            return <li key={article.slug}>
              <time className="notes-compact-date" dateTime={article.date} aria-label={date.full}>
                <span className="notes-compact-date-desktop" aria-hidden="true"><span className="notes-compact-date-day">{date.day}</span><span className="notes-compact-date-month">{date.month}</span><span className="notes-compact-date-weekday">{date.weekday}</span></span>
                <span className="notes-compact-date-mobile" aria-hidden="true">{date.mobile}</span>
              </time>
              <article className="notes-compact-paper" data-archive-note={article.slug}>
                <i className="notes-compact-bookmark" aria-hidden="true" /><Meta article={article} />
                <h3><Link prefetch={false} href={`/notes/${article.slug}`}>{article.title}</Link></h3><p>{article.summary}</p>
                <footer className="notes-compact-entry-footer"><span>手记 №{serialBySlug.get(article.slug)}</span><Link prefetch={false} href={`/notes/${article.slug}`}>阅读全文 →</Link></footer>
              </article>
            </li>;
          })}</ol>
        </section>)}
      </section>
  </div>;
}
