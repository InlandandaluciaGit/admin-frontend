import { Logo } from "@/components/common/Logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="theme-auth flex min-h-dvh flex-col bg-canvas text-fg">
      {/* Logo + card are centred vertically in the space above the footer. */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-12 short:py-6">
        <Logo priority className="h-24 sm:h-28 short:h-20" />
        <div className="mt-9 w-full max-w-[510px] sm:mt-10 short:mt-6">{children}</div>
      </main>
      <footer className="px-4 pb-6 text-center text-[0.8125rem] text-fg-muted sm:pb-8 short:pb-4">
        © 2026 Inland Andalucia. All rights reserved. Authorised personnel only.
      </footer>
    </div>
  );
}
