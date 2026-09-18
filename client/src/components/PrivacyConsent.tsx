import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ShieldCheck, X } from "lucide-react";

const CONSENT_KEY = "dealhunter-privacy-consent-v1";

export default function PrivacyConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(CONSENT_KEY) !== "accepted");
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      // The banner can still be dismissed when storage is unavailable.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside role="dialog" aria-label="Aviso de privacidade" className="fixed inset-x-3 bottom-20 z-[60] rounded-2xl border border-[#2f80ed]/35 bg-[#f4f8fd] p-4 text-[#122238] shadow-[0_18px_70px_rgba(0,0,0,.5)] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-[560px] sm:p-5">
      <button type="button" onClick={accept} aria-label="Fechar aviso de privacidade" className="absolute right-3 top-3 rounded-lg p-1 text-[#6f8fb2] hover:bg-[#2f80ed]/10 hover:text-[#122238]"><X className="size-4" /></button>
      <div className="flex gap-3 pr-5"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#2f80ed]/15 text-[#2468c7]"><ShieldCheck className="size-5" /></span><div><h2 className="text-base font-black">Sua privacidade é importante</h2><p className="mt-1 text-xs leading-relaxed text-[#4a617b]">Usamos armazenamento local para manter suas preferências e melhorar sua experiência. Ao continuar, você concorda com nossa <Link href="/politica-de-privacidade" className="font-bold text-[#2468c7] underline underline-offset-2">Política de Privacidade</Link>.</p></div></div>
      <div className="mt-4 flex items-center justify-end gap-3"><Link href="/politica-de-privacidade" className="text-xs font-semibold text-[#2468c7] hover:text-[#174a91]">Ler política</Link><button type="button" onClick={accept} className="rounded-xl bg-[#2f80ed] px-5 py-2.5 text-sm font-black text-white shadow-[0_5px_16px_rgba(139,22,207,.25)] transition hover:bg-[#2468c7] active:scale-[.97]">Aceitar</button></div>
    </aside>
  );
}
