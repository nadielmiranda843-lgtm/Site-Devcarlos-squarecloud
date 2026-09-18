import { Link, useLocation } from "wouter";
import { BarChart3, Bell, Calculator, Crown, Menu, PackageSearch, Radar, ShieldCheck, Smartphone, Trophy, X } from "lucide-react";
import { useEffect, useState } from "react";
import AuthDialog from "@/components/AuthDialog";

const items = [
  { href: "/", label: "Caçador", icon: Radar },
  { href: "/ofertas", label: "Ofertas", icon: PackageSearch },
  { href: "/alertas", label: "Drop Alerts", icon: Bell },
  { href: "/comparar", label: "Comparar preços", icon: BarChart3 },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/premium", label: "Premium", icon: Crown },
  { href: "/lotes", label: "Lotes B2B", icon: ShieldCheck },
  { href: "/frete", label: "Frete & câmbio", icon: Calculator },
  { href: "/aplicativo", label: "Aplicativo", icon: Smartphone },
];

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  useEffect(() => {
    const openAuth = (event: Event) => {
      const mode = (event as CustomEvent<"login" | "register">).detail || "login";
      setAuthMode(mode);
      setAuthOpen(true);
    };
    window.addEventListener("dealhunter:auth", openAuth);
    return () => window.removeEventListener("dealhunter:auth", openAuth);
  }, []);
  const active = (href: string) => href === "/" ? location === "/" : location.startsWith(href);
  return <div className="min-h-screen bg-[#070b13] text-[#eaf1ff]">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] border-r border-[#263653] bg-[#0b1220] lg:flex lg:flex-col">
      <Brand />
      <div className="mx-4 mb-5 rounded-2xl border border-[#31e6a7]/20 bg-[#10251f] p-3"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#67efc0]">Mercado EUA</p><p className="mt-1 text-xs text-[#b4c9c5]">Catálogo em atualização</p><span className="mt-3 flex items-center gap-2 text-[10px] text-[#6ff0c0]"><i className="size-1.5 rounded-full bg-[#31e6a7] shadow-[0_0_9px_#31e6a7]" /> fontes monitoradas</span></div>
      <nav className="flex-1 space-y-1 px-3">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${active(href) ? "bg-[#582cff] text-white shadow-[0_8px_24px_rgba(88,44,255,.24)]" : "text-[#9eabc2] hover:bg-white/[.05] hover:text-white"}`}><Icon className="size-[18px]" />{label}{label === "Drop Alerts" && <span className="ml-auto rounded-full bg-[#ffb84a] px-1.5 py-0.5 text-[9px] font-bold text-[#201605]">3</span>}</Link>)}</nav>
      <div className="border-t border-[#263653] p-4"><Link href="/extensao" className="block rounded-xl border border-[#8c75ff]/30 bg-[#171637] p-3 hover:border-[#8c75ff]"><p className="text-xs font-semibold">Extensão DealHunter</p><p className="mt-1 text-[10px] text-[#aab3ca]">Compare preços enquanto navega.</p></Link></div>
    </aside>
    <div className="lg:pl-[250px]"><header className="sticky top-0 z-30 border-b border-[#263653] bg-[#070b13]/90 backdrop-blur-xl"><div className="flex h-[70px] items-center gap-3 px-4 sm:px-7"><button onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-lg text-[#aab7cc] hover:bg-white/[.06] lg:hidden" aria-label="Abrir menu"><Menu className="size-5" /></button><div className="hidden font-mono text-[10px] uppercase tracking-[.18em] text-[#6f7f99] sm:block">DealHunter <span className="text-[#8e77ff]">/ {items.find(i => active(i.href))?.label ?? "Painel"}</span></div><Link href="/alertas" className="ml-auto grid size-9 place-items-center rounded-lg text-[#aab7cc] hover:bg-white/[.06]"><Bell className="size-[18px]" /><span className="absolute ml-4 mt-[-14px] size-1.5 rounded-full bg-[#ffb84a]" /></Link><button type="button" onClick={() => { setAuthMode("login"); setAuthOpen(true); }} className="hidden rounded-xl border border-[#8c75ff]/30 bg-[#171637] px-3 py-2 text-xs font-semibold text-[#d7ceff] hover:border-[#a99cff] sm:block">Entrar / Criar conta</button><Link href="/premium" className="hidden items-center gap-2 rounded-xl border border-[#8c75ff]/25 bg-[#171637] px-3 py-2 text-xs text-[#d7ceff] sm:flex"><Crown className="size-3.5 text-[#ffcf70]" /> Upgrade Premium</Link></div></header><main className="min-h-[calc(100vh-70px)]">{children}</main></div>
    {open && <div className="fixed inset-0 z-50 lg:hidden"><button onClick={() => setOpen(false)} className="absolute inset-0 bg-black/70" aria-label="Fechar menu" /><aside className="absolute inset-y-0 left-0 flex w-[285px] flex-col border-r border-[#263653] bg-[#0b1220] shadow-2xl"><div className="flex items-center justify-between p-5"><Brand /><button onClick={() => setOpen(false)} className="text-[#aab7cc]" aria-label="Fechar menu"><X className="size-5" /></button></div><button type="button" onClick={() => { setOpen(false); setAuthMode("login"); setAuthOpen(true); }} className="mx-4 mb-4 rounded-xl border border-[#8c75ff]/30 bg-[#171637] p-3 text-left text-xs text-[#d7ceff]">Entrar ou criar conta <span className="mt-1 block text-[10px] text-[#9fa8c0]">Acesse seus favoritos e alertas</span></button><nav className="flex-1 space-y-1 px-3">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${active(href) ? "bg-[#582cff] text-white" : "text-[#9eabc2]"}`}><Icon className="size-[18px]" />{label}</Link>)}</nav></aside></div>}
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#263653] bg-[#0b1220]/95 px-2 py-2 backdrop-blur-xl lg:hidden">{items.slice(0, 4).map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex flex-col items-center gap-1 py-1 text-[9px] ${active(href) ? "text-[#b7a9ff]" : "text-[#76859f]"}`}><Icon className="size-[18px]" /><span>{label}</span></Link>)}<Link href="/premium" className={`flex flex-col items-center gap-1 py-1 text-[9px] ${active("/premium") ? "text-[#b7a9ff]" : "text-[#76859f]"}`}><Crown className="size-[18px]" /><span>Premium</span></Link></nav>
    <AuthDialog open={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} />
  </div>;
}
function Brand() { return <Link href="/" className="mb-7 flex items-center gap-3 px-5 pt-5"><img src="/assets/dealhunter-logo-transparent.png" alt="DealFlash" className="h-10 w-[178px] object-contain object-left" /></Link>; }
