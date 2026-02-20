import { MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getLocaleFromPath } from "@/lib/i18n";

const FloatingContact = ({ className = "" }: { className?: string }) => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";

  return (
    <div className={`fixed bottom-6 right-6 flex flex-col gap-3 z-50 ${className}`}>
      <a
        href="https://wa.me/31640326650"
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-12 items-center gap-2 bg-emerald-700 text-white px-5 py-3 rounded-full shadow-lg shadow-emerald-700/30 hover:scale-105 transition-transform touch-manipulation"
      >
        <MessageCircle size={18} />
        {isEn ? "WhatsApp us" : "App ons"}
      </a>
    </div>
  );
};

export default FloatingContact;
