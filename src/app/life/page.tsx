import { loadDemoContent } from "@/lib/content";
import { LifeTimeline } from "@/components/life-timeline";
export const metadata = { title: "生活" };
export default function LifePage() {
  const { life } = loadDemoContent();
  const posts = life.map((entry, index) => ({
    id: "demo-life-" + index,
    kind: entry.kind,
    body: entry.body,
    displayDate: entry.displayDate,
    createdAt: entry.displayDate + "T12:00:00+08:00",
    updatedAt: entry.displayDate + "T12:00:00+08:00",
    ...(entry.image
      ? {
          image: {
            assetId: "demo-image-" + index,
            alt: entry.imageAlt!,
            variants: [
              {
                src: entry.image,
                width: entry.aspect === "portrait" ? 520 : 720,
                height: entry.aspect === "portrait" ? 700 : 480,
                mimeType: "image/svg+xml",
              },
            ],
          },
        }
      : {}),
  }));
  return <LifeTimeline posts={posts} />;
}
