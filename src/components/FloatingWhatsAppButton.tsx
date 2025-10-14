import whatsIcon from "@/assets/icones/whatsapp.svg";

interface FloatingWhatsAppButtonProps {
  phone: string;
  message?: string;
  position?: "bottom-right" | "bottom-left";
}

export default function FloatingWhatsAppButton({ 
  phone, 
  message = "",
  position = "bottom-right" 
}: FloatingWhatsAppButtonProps) {
  if (!phone) return null;

  const handleClick = () => {
    let url = `https://wa.me/${phone}`;
    if (message) {
      url += `?text=${encodeURIComponent(message)}`;
    }
    window.open(url, '_blank');
  };

  const positionClasses = position === "bottom-right" 
    ? "bottom-6 right-6" 
    : "bottom-6 left-6";

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      {/* Botão Principal */}
      <button
        onClick={handleClick}
        className="group relative w-16 h-16 bg-[#25d366] hover:bg-[#128C7E] rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
        aria-label="Abrir WhatsApp"
      >
        {/* Animação de pulso */}
        <div className="absolute inset-0 rounded-full bg-[#25d366] animate-ping opacity-20"></div>
        
        {/* Ícone do WhatsApp */}
        <img 
          src={whatsIcon} 
          alt="WhatsApp" 
          className="w-9 h-9 relative z-10"
        />
      </button>
    </div>
  );
}
