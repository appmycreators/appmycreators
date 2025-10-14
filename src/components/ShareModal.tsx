import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QRCode } from "react-qrcode-logo";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Page slug for the public page URL (/{slug})
   */
  slug?: string;
  /**
   * Optional full URL override
   */
  url?: string;
}

const ShareModal = ({ open, onClose, slug, url }: ShareModalProps) => {
  const { toast } = useToast();

  const shareUrl = useMemo(() => {
    if (url) return url;
    if (slug) return `https://mycreators.me/${slug}`;
    if (typeof window !== "undefined") return `${window.location.origin}/preview`;
    return "/preview";
  }, [url, slug]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copiado!", description: shareUrl });
    } catch (e) {
      toast({ title: "Não foi possível copiar o link", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[90vw] rounded-3xl p-0 overflow-hidden bg-[#121413] text-white border-0">
        <DialogTitle className="sr-only">Compartilhar seu link</DialogTitle>
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          {/* QR container with white padding to emulate border */}
          <div className="bg-white p-3 rounded-2xl">
            <QRCode
              value={shareUrl}
              size={300}
              logoImage="/images/logo.png"
              logoWidth={60}
              logoHeight={60}
              qrStyle="dots"
              eyeRadius={10}
              bgColor="#ffffff"
              fgColor="#000000"
              removeQrCodeBehindLogo={true}
            />
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-sm text-white/70">Meu link do MyCreators</p>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="text-lg font-semibold text-white underline decoration-white/40 hover:decoration-white"
            >
              {shareUrl.replace(/^https?:\/\//, "")}
            </a>
          </div>

          <Button
            onClick={handleCopy}
            className="mt-6 w-full h-12 rounded-full bg-white text-black hover:bg-white/90 text-base"
          >
            Copiar meu link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
