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
    <aside role="dialog" aria-label="Aviso de privacidade" className="fixed inset-x-3 bottom-20 z-[60] rounded-2xl border border-[#a855f7]/35 bg-[#fffdf5] p-4 text-[#24162f] shadow-[0_18px_70px_rgba(0,0,0,.5)] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-[560px] sm:p-5">
      <button type="button" onClick={accept} aria-label="Fechar aviso de privacidade" className="absolute right-3 top-3 rounded-lg p-1 text-[#80658e] hover:bg-[#a855f7]/10 hover:text-[#24162f]"><X className="size-4" /></button>
      <div className="flex gap-3 pr-5"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#a855f7]/15 text-[#7e22ce]"><ShieldCheck className="size-5" /></span><div><h2 className="text-base font-black">Sua privacidade é importante</h2><p className="mt-1 text-xs leading-relaxed text-[#654f70]">Usamos armazenamento local para manter suas preferências e melhorar sua experiência. Ao continuar, você concorda com nossa <Link href="/politica-de-privacidade" className="font-bold text-[#7e22ce] underline underline-offset-2">Política de Privacidade</Link>.</p></div></div>
      <div className="mt-4 flex items-center justify-end gap-3"><Link href="/politica-de-privacidade" className="text-xs font-semibold text-[#7e22ce] hover:text-[#581c87]">Ler política</Link><button type="button" onClick={accept} className="rounded-xl bg-[#8b16cf] px-5 py-2.5 text-sm font-black text-white shadow-[0_5px_16px_rgba(139,22,207,.25)] transition hover:bg-[#7411ad] active:scale-[.97]">Aceitar</button></div>
    </aside>
  );
}
