export const siteConfig = {
  name: "Milozpace",
  mark: "miloz",
  description: "一个保留呼吸感、阅读感与日常切片的个人站点公开版本。",
  intro: "在这里，设计不是装饰，而是一种把文字、时间与日常放回合适距离的方法。",
  navigation: [
    { href: "/", label: "首页" },
    { href: "/notes/", label: "手记" },
    { href: "/life/", label: "生活" },
    { href: "/says/", label: "一言" },
    { href: "/about/", label: "关于" },
  ],
  links: [
    { href: "/notes/", label: "阅读手记" },
    { href: "/about/", label: "了解项目" },
  ],
} as const;
