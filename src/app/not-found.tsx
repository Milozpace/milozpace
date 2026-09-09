import Link from "next/link";
export default function NotFound() { return <section className="not-found"><div><p>404 · NOT FOUND</p><h1>这一页还没有被写下。</h1><p>地址可能已经改变，也可能它从未存在。</p><Link prefetch={false} href="/">回到首页 →</Link></div></section>; }

