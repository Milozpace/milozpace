import type { Metadata } from "next";

import { SiteFrame } from "@/components/site-frame";
import { siteConfig } from "@/site.config";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const k='milozpace-theme';const s=localStorage.getItem(k);const c=s==='light'||s==='system'||s==='dark'?s:'system';const r=c==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):c;const d=document.documentElement;d.dataset.confirmedTheme=c;d.dataset.themeChoice=c;d.dataset.theme=r;d.style.colorScheme=r}catch(e){}`,
          }}
          id="theme-init"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add("home-motion-booting")}catch(e){}`,
          }}
          id="home-motion-init"
        />
      </head>
      <body>
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
