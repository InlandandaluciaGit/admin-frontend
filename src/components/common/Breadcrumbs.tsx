import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { BreadcrumbItem } from "@/types/navigation";

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const content = isFirst ? (
            <>
              <Icon name="home" size={15} />
              <span className="sr-only">{item.label}</span>
            </>
          ) : (
            item.label
          );
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="flex items-center rounded-md text-fg-subtle transition-colors hover:text-fg">
                  {content}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={cn("truncate", isLast ? "font-semibold text-fg" : "text-fg-subtle")}>
                  {content}
                </span>
              )}
              {!isLast ? <Icon name="chevronRight" size={14} className="shrink-0 text-fg-subtle/70" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
