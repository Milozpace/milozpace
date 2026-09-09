import Image from "next/image";
import Link from "next/link";
import { loadDemoContent } from "@/lib/content";
import { HomeNarrativeRefinedV3Motion } from "@/components/home-narrative-refined-v3-motion";

function shortDate(value: string) { return value.replaceAll("-", "."); }

function ProfileIcon({ id }: { id: "notes" | "life" | "says" | "about" }) {
  if (id === "notes") return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 19.5h3.2L19 8.7 15.3 5 4.5 15.8 5 19.5Z" /><path d="m13.8 6.5 3.7 3.7M4.5 21h15" /></svg>;
  if (id === "life") return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></svg>;
  if (id === "says") return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7.5 11.5H4.8c.1-3 1.2-4.8 3.5-6l1 1.7c-1.4.8-2 1.8-2.1 3h.3a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6Zm9 0h-2.7c.1-3 1.2-4.8 3.5-6l1 1.7c-1.4.8-2 1.8-2.1 3h.3a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6Z" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.25" /><path d="M5.5 19c.7-3.6 2.9-5.4 6.5-5.4s5.8 1.8 6.5 5.4" /></svg>;
}

export default function HomePage() {
  const { articles, life, says } = loadDemoContent();
  const photos = life.filter((entry) => entry.kind === "photo").slice(0, 2);
  return (
    <HomeNarrativeRefinedV3Motion>
      <section className="identity-hero shell" data-architecture-section="identity">
        <Image alt="公开版原创示例头像" className="identity-portrait" height={84} priority src="/demo/avatar.svg" width={84} />
        <div className="identity-intro-copy"><h1>Hi, I&apos;m <span className="identity-name">miloz</span>.</h1><p className="identity-position"><span className="position-line-desktop"><span>I build personal systems to understand myself,</span><span>learn better, and create freely.</span></span><span className="position-line-mobile"><span>I build personal systems</span><span>to understand myself, learn better,</span><span>and create freely.</span></span></p></div>
        <p className="identity-quote">「把脚步放慢以后，细节终于赶了上来。」</p>
        <nav className="profile-links" aria-label="站内入口">{([{ href: "/notes/", label: "手记", id: "notes" }, { href: "/life/", label: "生活", id: "life" }, { href: "/says/", label: "一言", id: "says" }, { href: "/about/", label: "关于", id: "about" }] as const).map((item) => <Link prefetch={false} aria-label={item.label} className="identity-profile-link" data-profile-label={item.label} href={item.href} key={item.href}><ProfileIcon id={item.id} /></Link>)}</nav>
      </section>

      <div className="chapter-transition transition-writing" aria-hidden="true"><svg viewBox="0 0 520 100"><g className="day-form"><path className="ink-main wind-path-main" pathLength="1" d="M28 61c54-7 85-34 137-29 45 4 70 30 119 25 50-5 83-34 153-25" /><path className="ink-secondary wind-path-wake" pathLength="1" d="M82 73c39-12 72-10 105 2 35 13 70 10 109-8" /><circle className="ink-speck wind-particle" cx="142" cy="25" r="1.35" /><circle className="ink-speck wind-particle" cx="369" cy="43" r="0.9" /></g><g className="night-form"><path className="wind-path-main" pathLength="1" d="M71 56c64-25 113-14 166 3 45 14 85 6 138-25" /><path className="wind-path-wake" pathLength="1" d="M167 70c36-8 69-6 101 3" opacity=".34" /><circle className="light-node wind-particle" cx="114" cy="44" r="1.25" /><circle className="light-node wind-particle" cx="376" cy="33" r="0.85" /></g></svg></div>

      <section className="section-band" data-architecture-section="writing-and-saying" data-writing-concept="sky-manuscript"><div className="shell writing-grid">
        <section className="writing-manuscript" aria-labelledby="writing-title"><div className="writing-manuscript-spine" aria-hidden="true" /><p className="section-kicker">Recent writing</p><h2 className="section-title" id="writing-title">近期手记</h2><ol className="writing-list">{articles.map((article, index) => <li key={article.slug}><Link prefetch={false} className="writing-entry" href={`/notes/${article.slug}/`}><span className="writing-index">{String(index + 1).padStart(2, "0")}</span><span className="writing-entry-copy"><strong className="writing-entry-title">{article.title}</strong><time dateTime={article.date}>{shortDate(article.date)}</time><span className="writing-entry-ink" aria-hidden="true" /></span></Link></li>)}</ol><Link prefetch={false} className="writing-colophon" href="/notes/">全部手记</Link></section>
        <aside className="daily-saying daily-saying-cloud-light" aria-labelledby="saying-title"><p className="section-kicker">A line for today</p><h2 className="section-title" id="saying-title">每日一言</h2><blockquote><p>{says[0]?.body}</p><cite>公开版原创示例</cite></blockquote></aside>
      </div></section>

      <section className="section-band" data-architecture-section="life" data-life-concept="natural-two-column" aria-labelledby="life-title"><div className="shell life-scene"><div className="life-air-frame"><header className="life-heading"><p className="section-kicker">Life fragments</p><h2 className="section-title" id="life-title">生活片段</h2></header><div className="life-stage">
        <div className="life-window-field" data-layout="portrait-landscape">{photos.map((photo, index) => <figure className={`life-window ${index === 0 ? "life-window--primary" : "life-window--secondary"}`} key={photo.displayDate}><div className="life-window-shell" style={{ "--life-photo-ratio": photo.aspect === "portrait" ? "3 / 4" : "4 / 3" } as React.CSSProperties}><Image alt={photo.imageAlt ?? "原创示例插画"} fill sizes="(max-width: 900px) 72vw, 20rem" src={photo.image!} /></div><figcaption><strong>{photo.body}</strong><time>{shortDate(photo.displayDate)}</time></figcaption></figure>)}</div>
        <section className="life-works-layer" aria-labelledby="life-works-title"><h3 className="life-works-kicker" id="life-works-title">いま見てる</h3><div className="life-work-pages"><figure className="life-work-page"><div className="life-work-shell"><Image alt="窗边晨光原创抽象插画" fill sizes="24rem" src="/demo/morning-window.svg" /></div><figcaption>窗边晨光</figcaption></figure><figure className="life-work-page"><div className="life-work-shell"><Image alt="傍晚原野原创抽象插画" fill sizes="24rem" src="/demo/evening-field.svg" /></div><figcaption>傍晚原野</figcaption></figure></div></section>
      </div><span className="life-air-node" /><span className="life-air-node" /><span className="life-air-node" /><span className="life-air-node" /></div></div></section>

      <div className="chapter-transition transition-interest" data-home-refined-v3-ending><svg className="page-breath-mark" aria-hidden="true" viewBox="0 0 176 52"><path className="page-breath-main page-breath-left" d="M8 31c22-8 47-14 78 2" /><path className="page-breath-main page-breath-right" d="M168 31c-22-8-47-14-78 2" /><path className="page-breath-edge page-breath-edge-left" d="M27 38c18-5 37-7 57-2" /><path className="page-breath-edge page-breath-edge-right" d="M149 38c-18-5-37-7-57-2" /><path className="page-breath-trace page-breath-trace-left" pathLength="1" d="M84 36c-20-5-39-3-57 2" /><path className="page-breath-trace page-breath-trace-right" pathLength="1" d="M92 36c20-5 39-3 57 2" /><path className="page-breath-spine" d="M88 29v13" /><circle className="page-breath-core" cx="88" cy="34" r="1.8" /></svg><p className="page-breath-caption">风停在旧页，光落向新章。</p></div>
    </HomeNarrativeRefinedV3Motion>
  );
}

