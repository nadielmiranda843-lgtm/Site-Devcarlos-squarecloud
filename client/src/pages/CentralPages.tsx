import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, CheckCircle2, LockKeyhole, MessageCircle, Send, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CentralLayout from "@/components/CentralLayout";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(mode === "login" ? "admin@spectertech.com" : "");
  const [password, setPassword] = useState(mode === "login" ? "admin" : "");
  const [confirm, setConfirm] = useState("");
  const login = trpc.auth.login.useMutation({ onSuccess: async () => { await utils.auth.me.invalidate(); toast.success("Login realizado com sucesso."); navigate("/perfil"); }, onError: error => toast.error(error.message) });
  const register = trpc.auth.register.useMutation({ onSuccess: async () => { await utils.auth.me.invalidate(); toast.success("Conta criada com sucesso."); navigate("/perfil"); }, onError: error => toast.error(error.message) });
  const submit = () => {
    if (mode === "login") return login.mutate({ email, password });
    if (!name.trim() || password.length < 10 || password !== confirm) return toast.error(password !== confirm ? "As senhas precisam ser iguais." : "Use uma senha com pelo menos 10 caracteres.");
    register.mutate({ name, email, password });
  };
  return <div className="min-h-screen bg-[#08070d] px-4 py-8 text-white sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl"><Link href="/" className="text-xs text-[#a99bb2] hover:text-white">← Voltar para o DealHunter</Link><div className="mx-auto mt-10 max-w-md rounded-2xl border border-[#a855f7]/25 bg-[#100d17] p-6 shadow-2xl sm:p-8"><div className="mb-7 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[#a855f7]/15 text-[#d8b4fe]"><LockKeyhole className="size-5" /></span><div><p className="text-[10px] uppercase tracking-[.2em] text-[#9f8daa]">DealHunter</p><h1 className="text-2xl font-semibold">{mode === "login" ? "Entrar na conta" : "Criar conta"}</h1></div></div>{mode === "register" && <label className="mb-4 block text-xs text-[#cfc1d8]">Nome<Input value={name} onChange={event => setName(event.target.value)} placeholder="Seu nome" className="mt-2 border-white/10 bg-white/[.04] text-white" /></label>}<label className="mb-4 block text-xs text-[#cfc1d8]">E-mail<Input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="voce@exemplo.com" className="mt-2 border-white/10 bg-white/[.04] text-white" /></label><label className="mb-4 block text-xs text-[#cfc1d8]">Senha<Input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder={mode === "register" ? "Pelo menos 10 caracteres" : "Sua senha"} className="mt-2 border-white/10 bg-white/[.04] text-white" /></label>{mode === "register" && <label className="mb-4 block text-xs text-[#cfc1d8]">Confirmar senha<Input type="password" value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="Repita sua senha" className="mt-2 border-white/10 bg-white/[.04] text-white" /></label>}<Button onClick={submit} disabled={login.isPending || register.isPending} className="w-full bg-[#a855f7] text-white hover:bg-[#9333ea]">{mode === "login" ? "Entrar" : "Criar conta"}<ArrowRight className="ml-2 size-4" /></Button><div className="mt-5 flex justify-between text-xs"><button onClick={() => navigate(mode === "login" ? "/criar-conta" : "/entrar")} className="text-[#c084fc] hover:text-white">{mode === "login" ? "Criar conta" : "Já possui conta? Entrar"}</button>{mode === "login" && <button onClick={() => toast.info("Recuperação de senha será ativada com o e-mail transacional.")} className="text-[#8f7ca1] hover:text-white">Esqueci minha senha</button>}</div></div></div></div>;
}

export function ProfilePage() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const logout = trpc.auth.logout.useMutation({ onSuccess: async () => { await utils.auth.me.invalidate(); toast.success("Sessão encerrada."); } });
  if (loading) return <CentralLayout><div className="p-10 text-center text-sm text-[#9d90a6]">Carregando perfil...</div></CentralLayout>;
  if (!user) return <CentralLayout><EmptyState title="Entre para acessar seu perfil" description="Salve ofertas, configure alertas e acompanhe sua conta." action="Entrar" href="/entrar" /></CentralLayout>;
  return <CentralLayout><div className="mx-auto max-w-3xl px-4 py-10"><p className="text-[10px] uppercase tracking-[.2em] text-[#8f7ca1]">Conta</p><h1 className="mt-2 text-4xl font-semibold">Olá, {user.name || "caçador"}.</h1><div className="mt-8 grid gap-4 sm:grid-cols-2"><Info label="E-mail" value={user.email || "Não informado"} /><Info label="Função" value={user.role === "admin" ? "Administrador" : "Caçador"} /></div><Button variant="outline" onClick={() => logout.mutate()} className="mt-6 border-white/15 text-white">Sair da conta</Button></div></CentralLayout>;
}

export function SupportPage() { const [message, setMessage] = useState(""); return <CentralLayout><div className="mx-auto max-w-3xl px-4 py-10"><p className="text-[10px] uppercase tracking-[.2em] text-[#8f7ca1]">Suporte</p><h1 className="mt-2 text-4xl font-semibold">Como podemos ajudar?</h1><a href="https://wa.me/5515992206724" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#d8b4fe]"><MessageCircle className="size-4" /> WhatsApp: +55 15 99220-6724</a><div className="mt-8 rounded-2xl border border-white/10 bg-[#100d17] p-6"><h2 className="text-xl font-semibold">Envie uma mensagem</h2><Textarea value={message} onChange={event => setMessage(event.target.value)} placeholder="Conte o que você precisa..." className="mt-4 min-h-32 border-white/10 bg-white/[.04] text-white" /><Button onClick={() => { if (!message.trim()) return toast.error("Escreva uma mensagem antes de enviar."); setMessage(""); toast.success("Mensagem enviada. Retornaremos em breve."); }} className="mt-4 bg-[#a855f7] text-white">Enviar para o suporte <Send className="ml-2 size-4" /></Button></div></div></CentralLayout>; }

export function PrivacyPage() { return <CentralLayout><div className="mx-auto max-w-3xl px-4 py-10"><p className="text-[10px] uppercase tracking-[.2em] text-[#8f7ca1]">Legal / privacidade</p><h1 className="mt-2 text-4xl font-semibold">Política de privacidade</h1><article className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-[#100d17] p-6 text-sm leading-relaxed text-[#b9adbf]"><section><h2 className="font-semibold text-white">Dados coletados</h2><p className="mt-2">Coletamos nome e e-mail para autenticação, suporte, favoritos e alertas.</p></section><section><h2 className="font-semibold text-white">Segurança</h2><p className="mt-2">Aplicamos controles de acesso e validação no backend. Nunca compartilhe sua senha.</p></section><section><h2 className="font-semibold text-white">Seus direitos</h2><p className="mt-2">Você pode solicitar atualização ou remoção de seus dados pelo suporte.</p></section></article></div></CentralLayout>; }

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-[#100d17] p-5"><span className="text-[10px] uppercase tracking-wider text-[#82768e]">{label}</span><strong className="mt-2 block text-sm text-[#d8b4fe]">{value}</strong></div>; }
function EmptyState({ title, description, action, href }: { title: string; description: string; action: string; href: string }) { return <div className="mx-auto max-w-xl px-4 py-20 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#a855f7]/15 text-[#d8b4fe]"><UserRound className="size-6" /></span><h1 className="mt-5 text-2xl font-semibold">{title}</h1><p className="mt-2 text-sm text-[#9d90a6]">{description}</p><Link href={href}><Button className="mt-6 bg-[#a855f7] text-white">{action}</Button></Link></div>; }
