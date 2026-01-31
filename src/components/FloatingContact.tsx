import { MessageCircle } from "lucide-react";

const FloatingContact = () => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <a
        href="https://wa.me/31640326650"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg shadow-green-500/30 hover:scale-105 transition-transform"
      >
        <MessageCircle size={18} />
        App ons
      </a>
    </div>
  );
};

export default FloatingContact;
