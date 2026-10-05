import { useEffect, useState } from "react";
import { copy } from "../data/copy";

export function SiteNav() {
  const [active, setActive] = useState(copy.nav[0]?.id ?? "oversigt");

  useEffect(() => {
    const elements = copy.nav
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.05, 0.2, 0.5] },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="subnav" aria-label="Sektioner">
      <div className="wrap">
        <ul>
          {copy.nav.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} aria-current={active === item.id ? "true" : undefined}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
