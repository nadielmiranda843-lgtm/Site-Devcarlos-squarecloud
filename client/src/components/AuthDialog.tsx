import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound, X } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type AuthMode = "login" | "register";

export default function AuthDialog({ open, onOpenChange, initialMode = "login" }: { open: boolean; onOpenChange: (open: boolean) => void; initialMode?: AuthMode }) {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      const currentUser = await utils.auth.me.fetch();
      toast.success("Login realizado com sucesso.");
      onOpenChange(false);
      navigate(currentUser?.role === "admin" ? "/admin" : "/perfil");
    },
    onError: error => toast.error(error.message),
  });
  const register = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Conta criada com sucesso.");
      onOpenChange(false);
      navigate("/perfil");
    },
    onError: error => toast.error(error.message),
  });
  const busy = login.isPending || register.isPending;

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPassword("");
    setConfirm("");
    setAcceptedPolicy(false);
  };

  const submit = () => {
    if (!email.trim() || !password) return toast.error("Preencha e-mail e senha.");
    if (mode === "login") return login.mutate({ email: email.trim(), password });
    if (!name.trim()) return toast.error("Informe seu nome.");
    if (password.length < 10) return toast.error("Use uma senha com pelo menos 10 caracteres.");
    if (password !== confirm) return toast.error("As senhas precisam ser iguais.");
    if (!acceptedPolicy) return toast.error("Aceite a política de privacidade para criar sua conta.");
    register.mutate({ name: name.trim(), email: email.trim(), password });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[min(720px,calc(100vh-2rem))] overflow-y-auto border-[#294b78] bg-[#08111f] p-0 text-white shadow-[0_24px_100px_rgba(0,0,0,.65)] sm:max-w-[880px]">
        <div className="grid overflow-hidden lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(54,132,255,.42),transparent_42%),linear-gradient(145deg,#10284b,#08111f_72%)] p-8 lg:block">
            <div className="absolute -right-16 -top-16 size-48 rounded-full border-[24px] border-[#62a8ff]/10" />
            <div className="relative flex h-full flex-col justify-between">
              <div><div className="grid size-12 place-items-center rounded-2xl border border-[#62a8ff]/30 bg-[#2f80ed]/15 text-[#b9dcff]"><ShieldCheck className="size-6" /></div><p className="mt-7 font-mono text-[10px] uppercase tracking-[.22em] text-[#7db8ff]">DealHunter</p><h2 className="mt-3 text-3xl font-black leading-tight">Seu radar de<br /><span className="text-[#62a8ff]">melhores ofertas.</span></h2><p className="mt-4 max-w-xs text-sm leading-relaxed text-[#aec3dd]">Salve oportunidades, receba Drop Alerts e acompanhe seus achados em qualquer dispositivo.</p></div>
              <div className="space-y-3 text-xs text-[#b9cde4]"><p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#62a8ff]" /> Favoritos sincronizados</p><p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#62a8ff]" /> Alertas personalizados</p><p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#62a8ff]" /> Conta protegida</p></div>
            </div>
          </div>
          <div className="p-5 sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-[#62a8ff]"><LockKeyhole className="size-4" /><span className="font-mono text-[10px] uppercase tracking-[.2em]">Acesso seguro</span></div><DialogTitle className="mt-3 text-2xl font-black">{mode === "login" ? "Bem-vindo de volta" : "Comece a caçar"}</DialogTitle><DialogDescription className="mt-2 text-xs text-[#aec3dd]">{mode === "login" ? "Entre para salvar ofertas e acompanhar seus alertas." : "Crie sua conta grátis e personalize seu radar."}</DialogDescription></div><button type="button" onClick={() => onOpenChange(false)} className="rounded-lg p-2 text-[#8aa4c1] hover:bg-[#2f80ed]/10 hover:text-white" aria-label="Fechar"><X className="size-5" /></button></div>
            <div className="mb-6 grid grid-cols-2 rounded-xl border border-[#294b78] bg-[#0d1b2e] p-1"><button type="button" onClick={() => changeMode("login")} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${mode === "login" ? "bg-[#2f80ed] text-white shadow-lg" : "text-[#aec3dd] hover:text-white"}`}>Entrar</button><button type="button" onClick={() => changeMode("register")} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${mode === "register" ? "bg-[#2f80ed] text-white shadow-lg" : "text-[#aec3dd] hover:text-white"}`}>Criar conta</button></div>
            <div className="space-y-4">
              {mode === "register" && <label className="block text-xs font-medium text-[#d5e4f5]">Nome completo<div className="relative mt-2"><UserRound className="absolute left-3 top-3 size-4 text-[#6f8fb2]" /><Input value={name} onChange={event => setName(event.target.value)} placeholder="Como podemos chamar você?" autoComplete="name" className="border-white/10 bg-white/[.04] pl-10 text-white placeholder:text-[#72647c] focus-visible:ring-[#2f80ed]" /></div></label>}
              <label className="block text-xs font-medium text-[#d5e4f5]">E-mail<Input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="voce@exemplo.com" autoComplete="email" className="mt-2 border-white/10 bg-white/[.04] text-white placeholder:text-[#72647c] focus-visible:ring-[#2f80ed]" /></label>
              <label className="block text-xs font-medium text-[#d5e4f5]">Senha<div className="relative mt-2"><Input type={showPassword ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} placeholder={mode === "register" ? "Mínimo de 10 caracteres" : "Sua senha"} autoComplete={mode === "register" ? "new-password" : "current-password"} className="border-white/10 bg-white/[.04] pr-11 text-white placeholder:text-[#72647c] focus-visible:ring-[#2f80ed]" /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-2.5 text-[#6f8fb2] hover:text-white" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>
              {mode === "register" && <><label className="block text-xs font-medium text-[#d5e4f5]">Confirmar senha<Input type="password" value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="Repita sua senha" autoComplete="new-password" className="mt-2 border-white/10 bg-white/[.04] text-white placeholder:text-[#72647c] focus-visible:ring-[#2f80ed]" /></label><label className="flex items-start gap-2 text-[11px] leading-relaxed text-[#aec3dd]"><input type="checkbox" checked={acceptedPolicy} onChange={event => setAcceptedPolicy(event.target.checked)} className="mt-0.5 size-4 accent-[#2f80ed]" /> <span>Li e aceito a <a href="/politica-de-privacidade" target="_blank" rel="noreferrer" className="font-bold text-[#62a8ff] underline underline-offset-2">Política de Privacidade</a> do DealHunter.</span></label></>}
              <Button type="button" onClick={submit} disabled={busy} className="mt-2 h-11 w-full rounded-xl bg-[#2f80ed] font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,.25)] hover:bg-[#2468c7]">{busy ? "Aguarde..." : mode === "login" ? "Entrar na minha conta" : "Criar minha conta grátis"}<ArrowRight className="ml-2 size-4" /></Button>
            </div>
            <p className="mt-5 text-center text-[11px] text-[#84758d]">Ao continuar, você concorda com a política de privacidade do DealHunter.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
