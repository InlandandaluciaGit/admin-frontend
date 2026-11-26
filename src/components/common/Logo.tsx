import Image from "next/image";
import { cn } from "@/lib/cn";
import { BRAND_NAME } from "@/constants/site";

interface LogoProps {
  /** `full` shows the logo with wordmark, `mark` shows only the house emblem. */
  variant?: "full" | "mark";
  className?: string;
  priority?: boolean;
}

/**
 * Official Inland Andalucía logo, copied from the public website
 * (FrontEnd/src/assets/images/logo/logo-ia.png). `inland-mark.png` is the
 * emblem cropped from the same file for the collapsed sidebar.
 *
 * Served `unoptimized` (as the original 16 KB PNG): re-encoding to lossy WebP
 * softens the thin script lettering and flat brand colours.
 */
export function Logo({ variant = "full", className, priority = false }: LogoProps) {
  return variant === "full" ? (
    <Image
      src="/images/inland-logo.png"
      alt={BRAND_NAME}
      width={354}
      height={170}
      priority={priority}
      unoptimized
      className={cn("h-11 w-auto", className)}
    />
  ) : (
    <Image
      src="/images/inland-mark.png"
      alt={BRAND_NAME}
      width={98}
      height={170}
      priority={priority}
      unoptimized
      className={cn("h-10 w-auto", className)}
    />
  );
}
