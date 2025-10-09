import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { X, Image as ImageIcon, Trash2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Lottie from "lottie-react";
import LottieAnimationPicker from "./LottieAnimationPicker";

// Carregar todos os arquivos .json da pasta lotties
const lottieFiles = import.meta.glob("@/assets/lotties/*.json", {
  eager: true,
  import: "default",
}) as Record<string, any>;

export interface GalleryItem {
  id: string;
  link: string;
  name: string;
  description?: string;
  price?: number; // guardado em centavos
  buttonText?: string;
  imageUrl?: string; // preview/base64 simples por enquanto
  destaque?: boolean;
  lottieAnimation?: string; // nome do arquivo lottie (ex: 'discount')
}

interface GalleryItemFormProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: GalleryItem) => void;
  onUpdateItem?: (item: GalleryItem) => void;
  initialItem?: GalleryItem;
  onDeleteItem?: (id: string) => void;
}

const formatBRL = (cents: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    (cents || 0) / 100
  );
};

const parseToCents = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return Number(digits || "0");
};

export default function GalleryItemForm({ open, onClose, onAddItem, onUpdateItem, initialItem, onDeleteItem }: GalleryItemFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [link, setLink] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceCents, setPriceCents] = useState(0);
  const [buttonText, setButtonText] = useState("Saiba Mais");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [destaque, setDestaque] = useState(false);
  const [enableLottie, setEnableLottie] = useState(false);
  const [lottieAnimation, setLottieAnimation] = useState<string>("");
  const [showLottiePicker, setShowLottiePicker] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialItem) {
        setLink(initialItem.link || "");
        setName(initialItem.name || "");
        setDescription(initialItem.description || "");
        setPriceCents(initialItem.price || 0);
        setButtonText(initialItem.buttonText || "Saiba Mais");
        setImageUrl(initialItem.imageUrl);
        setDestaque(initialItem.destaque || false);
        setEnableLottie(!!initialItem.lottieAnimation);
        setLottieAnimation(initialItem.lottieAnimation || "");
      } else {
        setLink("");
        setName("");
        setDescription("");
        setPriceCents(0);
        setButtonText("Saiba Mais");
        setImageUrl(undefined);
        setDestaque(false);
        setEnableLottie(false);
        setLottieAnimation("");
      }
    } else {
      // ao fechar, limpar
      setLink("");
      setName("");
      setDescription("");
      setPriceCents(0);
      setButtonText("Saiba Mais");
      setImageUrl(undefined);
      setDestaque(false);
      setEnableLottie(false);
      setLottieAnimation("");
    }
  }, [open, initialItem]);

  const priceDisplay = useMemo(() => formatBRL(priceCents), [priceCents]);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setLink(text.trim());
    } catch (e) {
      toast({
        title: "Não foi possível colar",
        description: "Permita acesso à área de transferência para colar automaticamente.",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.trim() || !name.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o Link e o Nome do produto.",
        variant: "destructive",
      });
      return;
    }

    const payload: GalleryItem = {
      id: initialItem?.id || "",
      link: link.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      price: priceCents,
      buttonText: buttonText.trim() || undefined,
      imageUrl,
      destaque,
      lottieAnimation: enableLottie ? lottieAnimation : undefined,
    };

    console.log('Payload being sent:', payload);
    console.log('enableLottie:', enableLottie);
    console.log('lottieAnimation state:', lottieAnimation);

    if (initialItem && onUpdateItem) {
      onUpdateItem(payload);
      toast({ title: "Item atualizado!", description: "As alterações foram salvas." });
    } else {
      onAddItem(payload);
      toast({ title: "Item adicionado!", description: "Seu produto foi criado com sucesso." });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{initialItem ? "Editar produto" : "Produto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Link */}
            <div>
              <Label htmlFor="product-link">Link* (Checkout ou Site)</Label>
              <div className="mt-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    id="product-link"
                    placeholder="google.com"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="pr-20 focus:border-[#00c6a9] focus:shadow-sm focus:outline-none"
                  />
                  {link && (
                    <button
                      type="button"
                      onClick={() => setLink("")}
                      className="absolute right-16 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Limpar link"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00c6a9] text-sm px-2 py-1 rounded-md hover:bg-[#00c6a9]/10"
                  >
                    Colar
                  </button>
                </div>
              </div>
            </div>

            {/* Nome */}
            <div>
              <Label htmlFor="product-name">Nome*</Label>
              <Input
                id="product-name"
                placeholder="Meu produto 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 focus:border-[#00c6a9]"
              />
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="product-description">Descrição</Label>
              <Input
                id="product-description"
                placeholder="Descrição do produto"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 focus:ring-2 focus:ring-[#00c6a9] focus:border-[#00c6a9]"
              />
            </div>

            {/* Valor */}
            <div>
              <Label htmlFor="product-price">Valor</Label>
              <Input
                id="product-price"
                placeholder="R$0,00"
                value={priceDisplay}
                onChange={(e) => setPriceCents(parseToCents(e.target.value))}
                className="mt-1 focus:ring-2 focus:ring-[#00c6a9] focus:border-[#00c6a9]"
              />
            </div>

            {/* Texto do botão */}
            <div>
              <Label htmlFor="button-text">Texto do botão</Label>
              <Input
                id="button-text"
                placeholder="Saiba Mais"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="mt-1 focus:ring-2 focus:ring-[#00c6a9] focus:border-[#00c6a9]"
              />
            </div>

            {/* Destaque */}
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="destaque-switch" className="cursor-pointer">Destaque?</Label>
              <Switch
                id="destaque-switch"
                checked={destaque}
                onCheckedChange={setDestaque}
              />
            </div>

            {/* Lottie Animation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="lottie-switch" className="cursor-pointer">Adicionar Sticker?</Label>
                <Switch
                  id="lottie-switch"
                  checked={enableLottie}
                  onCheckedChange={setEnableLottie}
                />
              </div>
              {enableLottie && (
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setShowLottiePicker(true)}
                  >
                    <Sparkles className="w-4 h-4" />
                    {lottieAnimation ? "Alterar animação" : "Escolher animação"}
                  </Button>
                  {lottieAnimation && (() => {
                    const animationData = lottieFiles[`/src/assets/lotties/${lottieAnimation}.json`];
                    return animationData ? (
                      <Card className="p-3 flex items-center gap-3">
                        <div className="w-16 h-16 flex items-center justify-center">
                          <Lottie
                            animationData={animationData}
                            loop={true}
                            style={{ width: 64, height: 64 }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Animação selecionada</div>
                          <div className="text-xs text-muted-foreground capitalize">{lottieAnimation}</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setLottieAnimation("")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </Card>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Lottie Picker Modal */}
            <LottieAnimationPicker
              open={showLottiePicker}
              onClose={() => setShowLottiePicker(false)}
              onSelect={(animation) => {
                console.log('Received animation in GalleryItemForm:', animation);
                setLottieAnimation(animation);
                setShowLottiePicker(false);
              }}
              selectedAnimation={lottieAnimation}
            />

            {/* Imagem */}
            <div>
              <Label>Imagem do produto</Label>
              <Card className="mt-2 p-3 flex items-center gap-3">
                {imageUrl ? (
                  <img src={imageUrl} alt="Pré-visualização" className="w-16 h-16 object-cover rounded-md" />
                ) : (
                  <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 flex items-center justify-end gap-2">
                  {imageUrl && (
                    <Button type="button" variant="secondary" onClick={() => setImageUrl(undefined)}>
                      Excluir
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="hover:bg-[#00c6a9] hover:text-white border-[#00c6a9]">
                    Selecionar
                  </Button>
                </div>
              </Card>
            </div>

            {/* Ações */}
            <div className="pt-4">
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/60 px-3 py-2">
                <Button type="submit" className="flex-1 bg-[#00c6a9] hover:bg-[#03816e]">Salvar</Button>
                <Button type="button" variant="outline" onClick={onClose} className="px-6 hover:bg-muted/50 hover:text-foreground">
                  Cancelar
                </Button>
                {initialItem?.id && onDeleteItem && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (!initialItem?.id) return;
                      onDeleteItem(initialItem.id);
                    }}
                    aria-label="Excluir produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
