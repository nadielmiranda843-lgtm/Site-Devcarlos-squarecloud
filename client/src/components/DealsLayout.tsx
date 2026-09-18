import { Link, useLocation } from "wouter";
import { BarChart3, Bell, Calculator, ChevronRight, Crown, Globe2, Menu, PackageSearch, Radar, Search, ShieldCheck, Smartphone, Trophy, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/_core/hooks/useAuth";

const items = [
  { href: "/", label: "Radar", icon: Radar },
  { href: "/localizador", label: "Localizador IA", icon: Globe2 },
  { href: "/ofertas", label: "Ofertas", icon: PackageSearch },
  { href: "/comparar", label: "Comparar", icon: BarChart3 },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/ranking", label: "Hunters", icon: Trophy },
];
const tools = [
  { href: "/frete", label: "Frete & câmbio", icon: Calculator },
  { href: "/lotes", label: "Lotes B2B", icon: ShieldCheck },
  { href: "/aplicativo", label: "Aplicativo", icon: Smartphone },
];

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const openAuth = (event: Event) => { setAuthMode((event as CustomEvent<"login" | "register">).detail || "login"); setAuthOpen(true); };
    window.addEventListener("dealhunter:auth", openAuth);
    return () => window.removeEventListener("dealhunter:auth", openAuth);
  }, []);
  const active = (href: string) => href === "/" ? location === "/" : location.startsWith(href);
  const navigateSearch = () => { if (query.trim()) window.location.href = `/ofertas?search=${encodeURIComponent(query.trim())}`; };
  const nav = (itemsList: typeof items) => itemsList.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`group dh-nav-item flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active(href) ? "dh-nav-active bg-[#3154ff] text-white shadow-[0_8px_28px_rgba(49,84,255,.28)]" : "text-[#8f9db7] hover:bg-white/[.06] hover:text-white"}`}><Icon className="size-[18px]" /><span>{label}</span>{active(href) && <ChevronRight className="ml-auto size-3.5 opacity-70" />}</Link>);
  return <div className="dh-page min-h-screen bg-[#070a12] text-[#eef4ff]">
    <aside className="dh-sidebar fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-[#202b47] bg-[#0b1020] lg:flex lg:flex-col">
      <Brand />
      <div className="mx-4 mb-6 rounded-2xl border border-[#3154ff]/25 bg-[linear-gradient(135deg,#121d43,#11162a)] p-4"><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#89a3ff]">DealHunter</p><span className="flex items-center gap-1.5 text-[10px] text-[#69e2bd]"><i className="size-1.5 rounded-full bg-[#55e3b3]" />online</span></div><p className="mt-3 text-sm font-bold">Seu radar de economia</p><p className="mt-1 text-[11px] leading-relaxed text-[#8997b2]">Compare antes de comprar.</p></div>
      <div className="flex-1 overflow-y-auto px-3"><p className="mb-2 px-3 font-mono text-[9px] uppercase tracking-[.2em] text-[#63718d]">Explorar</p><nav className="space-y-1">{nav(items)}</nav><p className="mb-2 mt-7 px-3 font-mono text-[9px] uppercase tracking-[.2em] text-[#63718d]">Ferramentas</p><nav className="space-y-1">{nav(tools)}</nav></div>
      <div className="border-t border-[#202b47] p-4"><button onClick={() => { setAuthMode("login"); setAuthOpen(true); }} className="flex w-full items-center gap-3 rounded-xl border border-[#2d3e68] bg-[#111a32] p-3 text-left hover:border-[#5274ff]"><span className="grid size-8 place-items-center rounded-lg bg-[#3154ff] text-xs font-black">DH</span><span className="min-w-0"><strong className="block text-xs">Entrar na conta</strong><small className="block truncate text-[10px] text-[#8290aa]">Favoritos e alertas sincronizados</small></span></button></div>
    </aside>
    <div className="lg:pl-[264px]">
      <header className="sticky top-0 z-30 border-b border-[#202b47]/90 bg-[#070a12]/90 backdrop-blur-xl"><div className="flex min-h-[76px] items-center gap-3 px-4 sm:px-7 lg:px-10"><button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl border border-[#202b47] text-[#b1bfd8] hover:bg-white/[.06] lg:hidden" aria-label="Abrir menu"><Menu className="size-5" /></button><div className="hidden text-xs font-semibold text-[#62718c] sm:block"><span className="text-[#eef4ff]">DealHunter</span><span className="mx-2 text-[#34415d]">/</span>{items.find(i => active(i.href))?.label ?? tools.find(i => active(i.href))?.label ?? "Central"}</div><div className="relative ml-auto flex w-full max-w-[460px] items-center"><Search className="absolute left-3.5 size-4 text-[#71809d]" /><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && navigateSearch()} placeholder="Buscar produto, marca ou loja..." className="h-11 w-full rounded-xl border border-[#263454] bg-[#0d1426] pl-10 pr-4 text-sm text-white outline-none placeholder:text-[#65728b] focus:border-[#5274ff] focus:ring-2 focus:ring-[#3154ff]/20" /></div><Link href="/alertas" className="relative grid size-10 shrink-0 place-items-center rounded-xl border border-[#202b47] text-[#aebbd2] hover:bg-white/[.06]" aria-label="Abrir alertas"><Bell className="size-[18px]" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#ffbf61]" /></Link><button onClick={() => { setAuthMode("login"); setAuthOpen(true); }} className="hidden h-10 rounded-xl bg-[#3154ff] px-4 text-xs font-bold text-white hover:bg-[#5274ff] sm:block">Entrar</button><Link href="/premium" className="hidden items-center gap-2 rounded-xl border border-[#344269] px-3 py-2 text-xs font-semibold text-[#b8c5de] hover:border-[#ffcb72] sm:flex"><Crown className="size-3.5 text-[#ffcb72]" /> Premium</Link></div></header>
      <main className="min-h-[calc(100vh-76px)]">{children}</main>
    </div>
    {open && <div className="fixed inset-0 z-50 lg:hidden"><button onClick={() => setOpen(false)} className="dh-mobile-drawer-backdrop absolute inset-0 bg-black/75" aria-label="Fechar menu" /><aside className="dh-mobile-drawer absolute inset-y-0 left-0 flex w-[292px] flex-col border-r border-[#202b47] bg-[#0b1020] shadow-2xl"><div className="flex items-center justify-between p-5"><Brand /><button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-lg text-[#aebbd2]" aria-label="Fechar menu"><X className="size-5" /></button></div><div className="px-3"><button onClick={() => { setOpen(false); setAuthMode("login"); setAuthOpen(true); }} className="mb-5 flex w-full items-center gap-3 rounded-xl border border-[#2d3e68] bg-[#111a32] p-3 text-left"><span className="grid size-8 place-items-center rounded-lg bg-[#3154ff] text-xs font-black">DH</span><span className="text-xs font-semibold">Entrar ou criar conta<small className="mt-1 block text-[10px] font-normal text-[#8290aa]">Salve ofertas e receba alertas</small></span></button></div><nav className="flex-1 space-y-1 overflow-y-auto px-3">{nav(items)}<p className="mb-2 mt-7 px-3 font-mono text-[9px] uppercase tracking-[.2em] text-[#63718d]">Ferramentas</p>{nav(tools)}</nav></aside></div>}
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#202b47] bg-[#0b1020]/95 px-1 py-2 pb-[max(.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">{items.slice(0, 4).map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex flex-col items-center gap-1 py-1 text-[9px] font-semibold ${active(href) ? "text-[#8ea5ff]" : "text-[#71809d]"}`}><Icon className="size-[18px]" /><span>{label}</span></Link>)}<Link href={user ? "/perfil" : "/entrar"} className={`flex flex-col items-center gap-1 py-1 text-[9px] font-semibold ${active(user ? "/perfil" : "/entrar") ? "text-[#8ea5ff]" : "text-[#71809d]"}`}><UserRound className="size-[18px]" /><span>{user ? "Perfil" : "Entrar"}</span></Link></nav>
    <AuthDialog open={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} />
  </div>;
}
function Brand() { return <Link href="/" className="mb-7 flex items-center gap-3 px-5 pt-5"><img src="/assets/dealhunter-logo-transparent.png" alt="DealHunter" className="dh-float h-10 w-[178px] object-contain object-left" /></Link>; }
