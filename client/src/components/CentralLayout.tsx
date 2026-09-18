import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Bell, Box, ChevronRight, CircleHelp, Code2, Heart, Home, LayoutGrid, LogIn, Menu, Package, Search, Settings, ShieldCheck, ShoppingBag, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";

export const navItems = [
  { label: "Caçador", href: "/", icon: Home },
  { label: "Ofertas", href: "/ofertas", icon: ShoppingBag },
  { label: "Drop Alerts", href: "/alertas", icon: Bell },
  { label: "Ranking", href: "/ranking", icon: UserRound },
  { label: "Suporte", href: "/suporte", icon: CircleHelp },
];

const accountItems = [
  { label: "Favoritos", href: "/ofertas", icon: Heart },
  { label: "Perfil", href: "/perfil", icon: UserRound },
  { label: "Premium", href: "/premium", icon: Settings },
  { label: "Política de privacidade", href: "/politica-de-privacidade", icon: ShieldCheck },
];

export default function CentralLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const isActive = (href: string) => href === "/" ? location === "/" : location.startsWith(href);
  const current = navItems.find(item => isActive(item.href))?.label ?? "Central";

  return (
    <div className="min-h-screen bg-[#08070d] text-[#f6f1ff]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] border-r border-white/[.08] bg-[#0c0a13] lg:flex lg:flex-col">
        <SidebarBrand />
        <div className="px-3">
          <Link href={user ? "/perfil" : "/entrar"} className="group flex items-center gap-3 rounded-xl border border-[#a855f7]/30 bg-[#a855f7]/[.09] px-3 py-3 hover:bg-[#a855f7]/[.16]">
            <span className="grid size-9 place-items-center rounded-lg bg-[#a855f7] text-white shadow-[0_0_22px_rgba(168,85,247,.42)]">{user ? <UserRound className="size-4" /> : <LogIn className="size-4" />}</span>
            <span className="min-w-0 flex-1"><strong className="block truncate text-xs">{user ? user.name || "Minha conta" : "Entrar na conta"}</strong><small className="block truncate text-[9px] uppercase tracking-[.14em] text-[#bba8cf]">{user ? "acessar perfil" : "acessar área privada"}</small></span>
            <ChevronRight className="size-4 text-[#9c7abc] transition group-hover:translate-x-0.5" />
          </Link>
          {!user && <Link href="/criar-conta" className="mt-2 block rounded-lg border border-white/10 px-3 py-2 text-center text-[10px] font-semibold text-[#d8b4fe] hover:border-[#a855f7]/40 hover:bg-[#a855f7]/10">Ainda não tenho conta · Criar agora</Link>}
        </div>
        <div className="mt-7 flex-1 overflow-y-auto px-3 pb-5">
          <p className="mb-2 px-3 font-mono text-[9px] font-medium uppercase tracking-[.2em] text-[#82768e]">Central</p>
          <nav className="space-y-1">{navItems.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition ${isActive(href) ? "bg-[#a855f7]/15 text-[#d8b4fe]" : "text-[#a39aac] hover:bg-white/[.05] hover:text-white"}`}><Icon className="size-4" /><span>{label}</span>{isActive(href) && <span className="ml-auto size-1.5 rounded-full bg-[#c084fc] shadow-[0_0_8px_#c084fc]" />}</Link>)}</nav>
          <p className="mb-2 mt-7 px-3 font-mono text-[9px] font-medium uppercase tracking-[.2em] text-[#82768e]">Conta</p>
          <nav className="space-y-1">{accountItems.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition ${isActive(href) ? "bg-[#a855f7]/15 text-[#d8b4fe]" : "text-[#a39aac] hover:bg-white/[.05] hover:text-white"}`}><Icon className="size-4" /><span>{label}</span></Link>)}</nav>
        </div>
        <div className="border-t border-white/[.08] px-5 py-4"><div className="flex items-center gap-2 text-[10px] text-[#bca9cc]"><span className="size-1.5 rounded-full bg-[#a855f7] shadow-[0_0_8px_#a855f7]" />Sistemas operacionais</div><p className="mt-1 text-[9px] text-[#71677a]">Todos os serviços disponíveis</p></div>
      </aside>

      <div className="lg:pl-[244px]">
        <header className="sticky top-0 z-30 border-b border-white/[.08] bg-[#08070d]/90 backdrop-blur-xl">
          <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="text-[#bca9cc] lg:hidden" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu"><Menu className="size-5" /></Button>
            <p className="hidden font-mono text-[10px] uppercase tracking-[.18em] text-[#766c81] sm:block">Central / <span className="text-[#c084fc]">{current}</span></p>
            <div className="relative ml-auto w-full max-w-[360px]"><Search className="absolute left-3 top-2.5 size-4 text-[#72677d]" /><Input value={search} onChange={event => setSearch(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && search.trim()) window.location.href = `/ofertas?search=${encodeURIComponent(search.trim())}`; }} placeholder="Buscar produtos e soluções" className="h-9 border-white/[.1] bg-white/[.04] pl-9 text-xs text-white placeholder:text-[#6d6276] focus-visible:ring-[#a855f7]" /><kbd className="pointer-events-none absolute right-2 top-2 hidden rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-[#766c81] sm:block">⌘ K</kbd></div>
            <div className="relative flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" aria-label="Notificações" onClick={() => setNotificationsOpen(value => !value)} className="relative text-[#bca9cc] hover:bg-white/[.06] hover:text-white"><Bell className="size-[18px]" /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#c084fc]" /></Button>
              {notificationsOpen && <div className="absolute right-0 top-11 w-64 rounded-xl border border-white/10 bg-[#15101e] p-4 shadow-2xl"><div className="flex items-center justify-between"><strong className="text-sm">Notificações</strong><Badge className="border-0 bg-[#a855f7]/20 text-[#d8b4fe]">1 nova</Badge></div><p className="mt-3 text-xs leading-relaxed text-[#a39aac]">Novidades, atualizações e oportunidades para o seu próximo projeto aparecem aqui.</p><Link href="/alertas" onClick={() => setNotificationsOpen(false)} className="mt-3 inline-flex text-xs font-semibold text-[#c084fc] hover:text-white">Abrir notificações <ChevronRight className="ml-1 size-3" /></Link></div>}
              <Link href="/premium" className="hidden h-9 items-center gap-2 rounded-md px-2 text-xs text-[#bca9cc] hover:bg-white/[.06] hover:text-white sm:flex"><span className="grid size-5 place-items-center rounded-full bg-[#a855f7]/20 text-[#d8b4fe]">✦</span>Saldo <span className="font-mono text-[#ded4e8]">R$ 0,00</span></Link>
              <Link href="/ofertas" aria-label="Carrinho" className="relative grid size-9 place-items-center rounded-md text-[#bca9cc] hover:bg-white/[.06] hover:text-white"><ShoppingBag className="size-[18px]" /><span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-[#a855f7] text-[9px] text-white">0</span></Link>
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-68px)]">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/[.1] bg-[#0c0a13]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
        {navItems.slice(0, 4).map(({ label, href, icon: Icon }) => <Link key={href} href={href} className={`flex flex-col items-center gap-1 py-1 text-[9px] ${isActive(href) ? "text-[#d8b4fe]" : "text-[#766c81]"}`}><Icon className="size-[18px]" /><span>{label}</span></Link>)}
        <Link href="/perfil" className={`flex flex-col items-center gap-1 py-1 text-[9px] ${isActive("/perfil") ? "text-[#d8b4fe]" : "text-[#766c81]"}`}><UserRound className="size-[18px]" /><span>Conta</span></Link>
      </nav>

      {mobileMenuOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-black/70" aria-label="Fechar menu" onClick={() => setMobileMenuOpen(false)} /><div className="absolute inset-y-0 left-0 w-[282px] border-r border-white/10 bg-[#0c0a13] shadow-2xl"><div className="flex items-center justify-between p-4"><SidebarBrand /><Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="text-[#bca9cc]"><X className="size-5" /></Button></div><div className="px-3"><Link href={user ? "/perfil" : "/entrar"} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl border border-[#a855f7]/30 bg-[#a855f7]/[.09] px-3 py-3"><span className="grid size-9 place-items-center rounded-lg bg-[#a855f7] text-white">{user ? <UserRound className="size-4" /> : <LogIn className="size-4" />}</span><span className="text-xs">{user ? user.name || "Minha conta" : "Entrar na conta"}</span></Link>{!user && <Link href="/criar-conta" onClick={() => setMobileMenuOpen(false)} className="mt-2 block rounded-lg border border-white/10 px-3 py-2 text-center text-[10px] font-semibold text-[#d8b4fe]">Criar uma conta grátis</Link>}</div><div className="mt-6 px-3"><p className="mb-2 px-3 font-mono text-[9px] uppercase tracking-[.2em] text-[#82768e]">Central</p>{navItems.map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-xs ${isActive(href) ? "bg-[#a855f7]/15 text-[#d8b4fe]" : "text-[#a39aac]"}`}><Icon className="size-4" />{label}</Link>)}</div><div className="mt-6 border-t border-white/[.08] px-3 pt-5">{accountItems.map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-xs text-[#a39aac]"><Icon className="size-4" />{label}</Link>)}</div></div></div>}
    </div>
  );
}

function SidebarBrand() {
  return <Link href="/" className="mb-7 flex items-center gap-3 px-5 pt-5"><img src="/assets/dealhunter-logo-transparent.png" alt="DealFlash" className="h-10 w-[178px] object-contain object-left" /></Link>;
}
