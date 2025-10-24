import { Copy, Check } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileImageUrl?: string;
  profileName: string;
  pageUrl: string;
}

const ShareModal = ({
  isOpen,
  onClose,
  profileImageUrl,
  profileName,
  pageUrl,
}: ShareModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[calc(100vw-2rem)] p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-4 sm:px-6 pt-6 pb-4">
          <DialogTitle className="text-center text-base sm:text-lg font-semibold">
            Compartilhar esta página
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 sm:px-6 pb-6">
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 space-y-4">
            {/* Avatar e Nome */}
            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white shadow-md border-2 border-white">
                <img
                  src={profileImageUrl || "/images/icon-512x512.png"}
                  alt={profileName}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                {profileName}
              </h3>
            </div>

            {/* URL com botão de copiar */}
            <div className="relative">
              <div className="bg-white rounded-xl px-3 sm:px-4 py-3 pr-11 sm:pr-12 border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-600 truncate">{pageUrl}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-gray-100"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-600" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
