import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ResourceSelector from "./ResourceSelector";
import LinkForm from "./LinkForm";
import LinkCard from "./LinkCard";
import { usePage } from "@/hooks/usePage";
import { usePageSync } from "@/hooks/usePageSync";
import { useGallerySync } from "@/hooks/useGallerySync";
import { useSocialSync } from "@/hooks/useSocialSync";
import { usePageSettings } from "@/hooks/usePageSettings";
import { useGalleryColors } from "@/hooks/useGalleryColors";
import { useImageBannerSync } from "@/hooks/useImageBannerSync";
import { useFormSync } from "@/hooks/useFormSync";
import { useToast } from "@/hooks/use-toast";
import { ResourceService } from "@/services/supabaseService";
import ProfileSection from "./ProfileSection";
import ProFeatures from "./ProFeatures";
import CustomizationModal from "./CustomizationModal";
import GalleryItemForm, { GalleryItem } from "./GalleryItemForm";
import WhatsAppForm from "./WhatsAppForm";
import GalleryRenameDialog from "./GalleryRenameDialog";
import EditHeaderForm from "./EditHeaderForm";
import SocialNetworksForm from "./SocialNetworksForm";
import SpotifyForm from "./SpotifyForm";
import SpotifyEmbedCard from "./SpotifyEmbedCard";
import YouTubeForm from "./YouTubeForm";
import YouTubeEmbedCard from "./YouTubeEmbedCard";
import ImageBannerForm from "./ImageBannerForm";
import ImageBannerCard from "./ImageBannerCard";
import { AddFormModal } from "./AddFormModal";
import { FormResource } from "./FormResource";
import eyeIcon from "@/assets/ui/eye.svg";

// Social icons map
const socialIconModules = import.meta.glob("@/assets/icones-redes-sociais/*.svg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const SOCIAL_ORDER = [
  "instagram",
  "facebook",
  "twitter",
  "tiktok",
  "youtube",
  "spotify",
  "threads",
  "telegram",
  "email",
];

const socialIconsMap: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const p in socialIconModules) {
    const name = p.split("/").pop()?.replace(".svg", "");
    if (name) m[name.toLowerCase()] = socialIconModules[p];
  }
  return m;
})();

// Util para mover itens em um array
function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  const startIndex = from < 0 ? newArray.length + from : from;
  if (startIndex >= 0 && startIndex < newArray.length) {
    const [item] = newArray.splice(from, 1);
    newArray.splice(to, 0, item);
  }
  return newArray;
}

// Item ordenável (via @dnd-kit/sortable)
interface SortableItemProps {
  id: string;
  children: ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <div className="relative">
        {/* Drag handle */}
        <button
          type="button"
          className="absolute left-2 top-2 z-10 h-8 w-8 rounded-full bg-white/90 text-muted-foreground shadow flex items-center justify-center hover:bg-white cursor-grab active:cursor-grabbing select-none touch-none"
          {...attributes}
          {...listeners}
          aria-label="Reordenar"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string;
  image?: string;
  bgColor?: string;
  hideUrl?: boolean;
}

interface Gallery {
  id: string;
  title: string;
  items: GalleryItem[];
  collapsed?: boolean;
}

// Função para determinar se a cor é clara ou escura
const isLightColor = (color: string): boolean => {
  if (!color) return false;
  
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
};

const MainContent = () => {
  // Hooks do Supabase para sincronização
  const { pageData, loading: pageLoading, updateSettings, refreshPage } = usePage();
  const [username, setUsername] = useState<string>('');
  const {
    links,
    loading: linksLoading,
    saveStatus,
    addLink,
    updateLink,
    deleteLink,
    reorderLinks,
  } = usePageSync();
  const {
    galleries,
    addGallery,
    updateGallery,
    deleteGallery,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    reorderGalleries,
    toggleCollapse,
    loading: galleriesLoading,
  } = useGallerySync();
  const {
    imageBanners,
    addImageBanner,
    updateImageBanner,
    deleteImageBanner,
    loading: imageBannersLoading,
  } = useImageBannerSync();
  const { addForm, updateForm, updateResourceTitle, deleteForm, loading: formLoading } = useFormSync();
  const { toast } = useToast();

  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  const [showSpotifyForm, setShowSpotifyForm] = useState(false);
  const [showYouTubeForm, setShowYouTubeForm] = useState(false);
  const [showImageBannerForm, setShowImageBannerForm] = useState(false);
  const [showSocialsForm, setShowSocialsForm] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingForm, setEditingForm] = useState<any>(null);
  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [renamingGalleryId, setRenamingGalleryId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [editingImageBanner, setEditingImageBanner] = useState<{id: string; title: string; imageUrl: string; linkUrl?: string} | null>(null);
  const [showEditHeader, setShowEditHeader] = useState(false);
  
  // Sincronização com Supabase
  const { socials, socialsDisplayMode, updateSocials, deleteAllSocials, loading: socialsLoading } = useSocialSync();
  
  useEffect(() => {
    if (pageData.username) {
      setUsername(pageData.username);
      return;
    }

    if (pageData.page?.user_id) {
      setUsername(pageData.page.user_id.slice(0, 6));
    }
  }, [pageData.username, pageData.page?.user_id]);
  const { backgroundColor, updateBackgroundColor, cardBgColor, cardTextColor, updateCardBgColor, updateCardTextColor, headerNameColor, headerBioColor, updateHeaderNameColor, updateHeaderBioColor, socialIconBgColor, socialIconColor, updateSocialIconBgColor, updateSocialIconColor, loading: settingsLoading } = usePageSettings();
  const {
    galleryTitleColor,
    galleryCardBgColor,
    galleryProductNameColor,
    galleryProductDescriptionColor,
    galleryButtonBgColor,
    galleryButtonTextColor,
    galleryPriceColor,
    galleryHighlightBgColor,
    galleryHighlightTextColor,
    updateGalleryTitleColor,
    updateGalleryCardBgColor,
    updateGalleryProductNameColor,
    updateGalleryProductDescriptionColor,
    updateGalleryButtonBgColor,
    updateGalleryButtonTextColor,
    updateGalleryPriceColor,
    updateGalleryHighlightBgColor,
    updateGalleryHighlightTextColor,
  } = useGalleryColors();
  // Ordem unificada de blocos (galeria, link, image_banner e form)
  const [blocksOrder, setBlocksOrder] = useState<Array<{ type: "gallery" | "link" | "image_banner" | "form"; id: string }>>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sincroniza blocksOrder com dados atuais baseado no display_order do banco
  useEffect(() => {
    if (!pageData.resources || pageData.resources.length === 0) return;
    const formResources = pageData.resources.filter(r => r.type === 'form');
    if (galleries.length === 0 && links.length === 0 && imageBanners.length === 0 && formResources.length === 0) return;

    console.log('Syncing blocksOrder - galleries:', galleries.length, 'links:', links.length, 'imageBanners:', imageBanners.length, 'forms:', formResources.length);

    // Criar mapa de resources por ID para pegar display_order
    const resourceMap = new Map(
      pageData.resources.map((r) => [r.id, r.display_order])
    );

    // Combinar todos os items com seu display_order
    const allItems = [
      ...galleries.map((g) => ({
        type: "gallery" as const,
        id: g.id,
        order: resourceMap.get(g.id) ?? 9999,
      })),
      ...links.map((l) => ({
        type: "link" as const,
        id: l.id,
        order: resourceMap.get(l.id) ?? 9999,
      })),
      ...imageBanners.map((ib) => ({
        type: "image_banner" as const,
        id: ib.id,
        order: resourceMap.get(ib.id) ?? 9999,
      })),
      ...formResources.map((f) => ({
        type: "form" as const,
        id: f.id,
        order: resourceMap.get(f.id) ?? 9999,
      })),
    ];

    console.log('All items before sort:', allItems);

    // Ordenar por display_order
    allItems.sort((a, b) => a.order - b.order);

    console.log('All items after sort:', allItems);

    // Criar novo blocksOrder
    const newBlocksOrder = allItems.map(({ type, id }) => ({ type, id }));
    
    console.log('Setting blocksOrder to:', newBlocksOrder);
    setBlocksOrder(newBlocksOrder);
  }, [galleries, links, imageBanners, pageData.resources]);

  // Configuração do DnD
  const sensors = useSensors(
    // Desktop: mouse com pequena distância para não conflitar com cliques
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    // Mobile: atraso curto e tolerância para evitar conflito com scroll
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const parseId = (id: string) => {
    if (id.startsWith("gallery-")) return { type: "gallery" as const, raw: id.replace("gallery-", "") };
    if (id.startsWith("link-")) return { type: "link" as const, raw: id.replace("link-", "") };
    if (id.startsWith("image_banner-")) return { type: "image_banner" as const, raw: id.replace("image_banner-", "") };
    if (id.startsWith("form-")) return { type: "form" as const, raw: id.replace("form-", "") };
    return { type: "unknown" as const, raw: id };
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const a = parseId(String(active.id));
    const o = parseId(String(over.id));
    
    console.log('Drag end:', { from: a, to: o });
    
    // Reordenamos no nível de blocksOrder para permitir mistura de tipos
    const from = blocksOrder.findIndex((b) => b.type === a.type && b.id === a.raw);
    const to = blocksOrder.findIndex((b) => b.type === o.type && b.id === o.raw);
    
    console.log('Indexes:', { from, to, blocksOrderLength: blocksOrder.length });
    
    if (from !== -1 && to !== -1 && from !== to) {
      // Atualizar ordem visual
      const newBlocksOrder = arrayMove(blocksOrder, from, to);
      setBlocksOrder(newBlocksOrder);
      
      // Atualizar display_order de TODOS os resources no banco
      try {
        const updates = newBlocksOrder.map((block, index) => ({
          id: block.id,
          display_order: index,
        }));
        
        console.log('Updating display_order for all resources:', updates);
        
        const success = await ResourceService.reorderResources(updates);
        
        if (success) {
          toast({
            title: "Salvo!",
            description: "A ordem foi atualizada.",
          });
        } else {
          console.error('Failed to reorder resources');
        }
      } catch (error) {
        console.error('Error reordering resources:', error);
        toast({
          title: "Erro!",
          description: "Não foi possível salvar a ordem.",
          variant: "destructive",
        });
      }
    }
    
    setActiveId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveId(id);
    const a = parseId(id);
    // Ao iniciar arraste de galeria, colapsar se estiver expandida
    if (a.type === "gallery") {
      toggleCollapse(a.raw);
    }
  };

  const handleSelectResource = (resource: any) => {
    if (resource.id === "link-button") {
      setShowLinkForm(true);
    }
    if (resource.id === "gallery") {
      // Adiciona uma nova galeria no banco
      const title = `Galeria ${galleries.length + 1}`;
      addGallery(title)
        .then((resourceId) => {
          if (resourceId) {
            // Não precisa adicionar manualmente ao blocksOrder
            // O useEffect irá sincronizar automaticamente após refreshPage
            toast({
              title: "Galeria criada!",
              description: "Sua nova galeria foi adicionada.",
            });
          } else {
            throw new Error('Resource ID não retornado');
          }
        })
        .catch((error) => {
          console.error('Erro ao criar galeria:', error);
          toast({
            title: "Erro!",
            description: "Não foi possível criar a galeria.",
            variant: "destructive",
          });
        });
    }
    if (resource.id === "whatsapp-button") {
      setShowWhatsAppForm(true);
    }
    if (resource.id === "social-networks") {
      setShowSocialsForm(true);
    }
    if (resource.id === "spotify") {
      setShowSpotifyForm(true);
    }
    if (resource.id === "youtube") {
      setShowYouTubeForm(true);
    }
    if (resource.id === "image-section") {
      setShowImageBannerForm(true);
    }
    if (resource.id === "form") {
      setShowFormModal(true);
    }
    // Handle other resource types here in the future
  };

  const handleAddLink = async (linkData: { title: string; url: string; icon?: string; image?: string; bgColor?: string; hideUrl?: boolean }) => {
    await addLink(linkData);
    await refreshPage();
  };

  const handleDeleteLink = async (id: string) => {
    await deleteLink(id);
    setBlocksOrder((prev) => prev.filter((b) => !(b.type === "link" && b.id === id)));
    toast({
      title: "Link excluído!",
      description: "O link foi removido com sucesso.",
    });
  };

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    if (link.url.includes("wa.me")) {
      setShowWhatsAppForm(true);
    } else if (link.url.includes("open.spotify.com")) {
      setShowSpotifyForm(true);
    } else if (link.url.includes("youtube.com") || link.url.includes("youtu.be")) {
      setShowYouTubeForm(true);
    } else {
      setShowLinkForm(true);
    }
  };

  const handleUpdateLink = async (id: string, data: { title: string; url: string; icon?: string; image?: string; bgColor?: string; hideUrl?: boolean }) => {
    await updateLink(id, data);
    setEditingLink(null);
    setShowLinkForm(false);
    setShowWhatsAppForm(false);
  };

  const handleAddImageBanner = async (bannerData: { title: string; imageUrl: string; linkUrl?: string }) => {
    await addImageBanner(bannerData);
    toast({
      title: "Imagem/Banner adicionado!",
      description: "Seu banner foi adicionado com sucesso.",
    });
  };

  const handleEditImageBanner = (banner: { id: string; title: string; imageUrl: string; linkUrl?: string }) => {
    setEditingImageBanner(banner);
    setShowImageBannerForm(true);
  };

  const handleUpdateImageBanner = async (id: string, data: { title: string; imageUrl: string; linkUrl?: string }) => {
    await updateImageBanner(id, data);
    setEditingImageBanner(null);
    setShowImageBannerForm(false);
    toast({
      title: "Imagem/Banner atualizado!",
      description: "Suas alterações foram salvas.",
    });
  };

  const handleDeleteImageBanner = async (id: string) => {
    await deleteImageBanner(id);
    setBlocksOrder((prev) => prev.filter((b) => !(b.type === "image_banner" && b.id === id)));
    toast({
      title: "Imagem/Banner excluído!",
      description: "O banner foi removido com sucesso.",
    });
  };

  const handleEditForm = (formResource: any) => {
    setEditingForm({
      id: formResource.id,
      title: formResource.title,
      form_data: formResource.form_data
    });
    setShowFormModal(true);
  };

  const handleDeleteForm = async (id: string) => {
    try {
      await deleteForm(id);
      setBlocksOrder((prev) => prev.filter((b) => !(b.type === "form" && b.id === id)));
      toast({
        title: "Formulário excluído!",
        description: "O formulário foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o formulário.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (pageLoading || linksLoading || galleriesLoading || socialsLoading || settingsLoading || imageBannersLoading || formLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header Shimmer */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-48 h-6 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-64 h-4 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          
          {/* Cards Shimmer */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-card">
                <div className="space-y-3">
                  <div className="w-3/4 h-5 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="w-1/2 h-4 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 overflow-hidden flex flex-col min-h-0 ${backgroundColor ? '' : 'bg-white'}`}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-24 md:pb-6 space-y-6">
        {/* Ações acima dos elementos */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto gap-2 rounded-full hover:bg-[#00c6a9] hover:text-white"
            onClick={() => setShowCustomization(true)}
          >
            🎨 Cores
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto gap-2 rounded-full hover:bg-[#00c6a9] hover:text-white"
            onClick={() => setShowEditHeader(true)}
          >
            <Edit className="w-4 h-4" />
            Editar Cabeçalho
          </Button>
        </div>

        {/* Resource Selector */}
        <ResourceSelector onSelectResource={handleSelectResource} />
        
        {/* Link Form Modal */}
        <LinkForm 
          open={showLinkForm}
          onClose={() => {
            setShowLinkForm(false);
            setEditingLink(null);
          }}
          onAddLink={handleAddLink}
          initialLink={editingLink && !editingLink.url.includes("wa.me") ? { id: editingLink.id, title: editingLink.title, url: editingLink.url, icon: editingLink.icon, image: editingLink.image, hideUrl: editingLink.hideUrl } : undefined}
          onUpdateLink={handleUpdateLink}
        />

        {/* WhatsApp Modal */}
        <WhatsAppForm
          open={showWhatsAppForm}
          onClose={() => {
            setShowWhatsAppForm(false);
            setEditingLink(null);
          }}
          onAddLink={handleAddLink}
          initialLink={editingLink && editingLink.url.includes("wa.me") ? { id: editingLink.id, title: editingLink.title, url: editingLink.url, image: editingLink.image, bgColor: editingLink.bgColor } : undefined}
          onUpdateLink={handleUpdateLink}
        />

        {/* Social Networks Modal */}
        <SocialNetworksForm
          open={showSocialsForm}
          onClose={() => setShowSocialsForm(false)}
          initialValues={socials}
          initialDisplayMode={socialsDisplayMode}
          onSave={async ({ socials: s, displayMode }) => {
            await updateSocials(s, displayMode);
            toast({
              title: "Redes sociais salvas!",
              description: "Suas redes sociais foram atualizadas.",
            });
          }}
          onDelete={async () => {
            await deleteAllSocials();
            toast({
              title: "Redes sociais excluídas!",
              description: "Todas as redes sociais foram removidas.",
            });
          }}
        />

        {/* Spotify Modal */}
        <SpotifyForm
          open={showSpotifyForm}
          onClose={() => {
            setShowSpotifyForm(false);
            setEditingLink(null);
          }}
          onAddLink={handleAddLink}
          onUpdateLink={handleUpdateLink}
          initialLink={
            editingLink && editingLink.url.includes("open.spotify.com")
              ? { id: editingLink.id, title: editingLink.title, url: editingLink.url, image: editingLink.image, hideUrl: editingLink.hideUrl }
              : undefined
          }
        />

        {/* YouTube Modal */}
        <YouTubeForm
          open={showYouTubeForm}
          onClose={() => {
            setShowYouTubeForm(false);
            setEditingLink(null);
          }}
          onAddLink={handleAddLink}
          onUpdateLink={handleUpdateLink}
          initialLink={
            editingLink && (editingLink.url.includes("youtube.com") || editingLink.url.includes("youtu.be"))
              ? { id: editingLink.id, title: editingLink.title, url: editingLink.url, image: editingLink.image, hideUrl: editingLink.hideUrl }
              : undefined
          }
        />

        {/* Image/Banner Modal */}
        <ImageBannerForm
          open={showImageBannerForm}
          onClose={() => {
            setShowImageBannerForm(false);
            setEditingImageBanner(null);
          }}
          onAddImageBanner={handleAddImageBanner}
          onUpdateImageBanner={handleUpdateImageBanner}
          initialBanner={editingImageBanner ?? undefined}
        />

        {/* Gallery Item Modal */}
        <GalleryItemForm
          open={showGalleryForm}
          onClose={() => {
            setShowGalleryForm(false);
            setEditingGalleryItem(null);
            setActiveGalleryId(null);
          }}
          initialItem={editingGalleryItem ?? undefined}
          onAddItem={async (item) => {
            if (!activeGalleryId) return;
            await addGalleryItem(activeGalleryId, item);
            toast({
              title: "Item adicionado!",
              description: "O item foi adicionado à galeria.",
            });
          }}
          onUpdateItem={async (item) => {
            if (!activeGalleryId || !item.id) return;
            await updateGalleryItem(activeGalleryId, item.id, item);
            toast({
              title: "Item atualizado!",
              description: "As alterações foram salvas.",
            });
          }}
          onDeleteItem={async (id) => {
            if (!activeGalleryId) return;
            await deleteGalleryItem(activeGalleryId, id);
            setShowGalleryForm(false);
            setEditingGalleryItem(null);
            setActiveGalleryId(null);
            toast({
              title: "Item deletado!",
              description: "O item foi removido da galeria.",
            });
          }}
        />

        {/* Gallery Rename Dialog */}
        <GalleryRenameDialog
          open={!!renamingGalleryId}
          initialTitle={galleries.find((g) => g.id === renamingGalleryId)?.title || ""}
          onClose={() => setRenamingGalleryId(null)}
          onSave={async (newTitle) => {
            if (!renamingGalleryId) return;
            await updateGallery(renamingGalleryId, newTitle);
            setRenamingGalleryId(null);
            toast({
              title: "Galeria renomeada!",
              description: "O título foi atualizado.",
            });
          }}
          onDelete={async () => {
            if (!renamingGalleryId) return;
            await deleteGallery(renamingGalleryId);
            setBlocksOrder((prev) => prev.filter((b) => !(b.type === "gallery" && b.id === renamingGalleryId)));
            setRenamingGalleryId(null);
            toast({
              title: "Galeria deletada!",
              description: "A galeria foi removida.",
            });
          }}
        />
        
        {/* Customization Modal */}
        <CustomizationModal 
          open={showCustomization}
          onClose={() => setShowCustomization(false)}
          onSelectBackground={async (color) => {
            await updateBackgroundColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor de fundo foi alterada.",
            });
          }}
          currentBackground={backgroundColor}
          onSelectCardBgColor={async (color) => {
            await updateCardBgColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor de fundo dos cards foi alterada.",
            });
          }}
          currentCardBgColor={cardBgColor}
          onSelectCardTextColor={async (color) => {
            await updateCardTextColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor do texto dos cards foi alterada.",
            });
          }}
          currentCardTextColor={cardTextColor}
          onSelectHeaderNameColor={async (color) => {
            await updateHeaderNameColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor do nome foi alterada.",
            });
          }}
          currentHeaderNameColor={headerNameColor}
          onSelectHeaderBioColor={async (color) => {
            await updateHeaderBioColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor da bio foi alterada.",
            });
          }}
          currentHeaderBioColor={headerBioColor}
          onSelectGalleryTitleColor={async (color) => {
            await updateGalleryTitleColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor do título da galeria foi alterada.",
            });
          }}
          currentGalleryTitleColor={galleryTitleColor}
          onSelectGalleryCardBgColor={async (color) => {
            await updateGalleryCardBgColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor de fundo do card foi alterada.",
            });
          }}
          currentGalleryCardBgColor={galleryCardBgColor}
          onSelectGalleryProductNameColor={async (color) => {
            await updateGalleryProductNameColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor do nome do produto foi alterada.",
            });
          }}
          currentGalleryProductNameColor={galleryProductNameColor}
          onSelectGalleryProductDescriptionColor={async (color) => {
            await updateGalleryProductDescriptionColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor da descrição foi alterada.",
            });
          }}
          currentGalleryProductDescriptionColor={galleryProductDescriptionColor}
          onSelectGalleryButtonBgColor={async (color) => {
            await updateGalleryButtonBgColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor do botão foi alterada.",
            });
          }}
          currentGalleryButtonBgColor={galleryButtonBgColor}
          onSelectGalleryButtonTextColor={async (color) => {
            await updateGalleryButtonTextColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor do texto do botão foi alterada.",
            });
          }}
          currentGalleryButtonTextColor={galleryButtonTextColor}
          onSelectGalleryPriceColor={async (color) => {
            await updateGalleryPriceColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor do preço foi alterada.",
            });
          }}
          currentGalleryPriceColor={galleryPriceColor}
          onSelectGalleryHighlightBgColor={async (color) => {
            await updateGalleryHighlightBgColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor de fundo do destaque foi alterada.",
            });
          }}
          currentGalleryHighlightBgColor={galleryHighlightBgColor}
          onSelectGalleryHighlightTextColor={async (color) => {
            await updateGalleryHighlightTextColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor do texto do destaque foi alterada.",
            });
          }}
          currentGalleryHighlightTextColor={galleryHighlightTextColor}
          onSelectSocialIconBgColor={async (color) => {
            await updateSocialIconBgColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor de fundo dos ícones sociais foi alterada.",
            });
          }}
          currentSocialIconBgColor={socialIconBgColor}
          onSelectSocialIconColor={async (color) => {
            await updateSocialIconColor(color);
            toast({
              title: "Cor atualizada!",
              description: "A cor dos ícones sociais foi alterada.",
            });
          }}
          currentSocialIconColor={socialIconColor}
        />

        {/* Edit Header Modal */}
        <EditHeaderForm open={showEditHeader} onClose={() => setShowEditHeader(false)} />

        {/* Add Form Modal */}
        <AddFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingForm(null);
          }}
          editingForm={editingForm}
        />

        {/* Drag-and-Drop: Lista unificada (galerias e links) - sortable */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext
            items={blocksOrder.map((b) => `${b.type}-${b.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {blocksOrder.map((block) => {
                if (block.type === "gallery") {
                  const gallery = galleries.find((g) => g.id === block.id);
                  if (!gallery) return null;
                  return (
                    <SortableItem id={`gallery-${gallery.id}`} key={`gallery-${gallery.id}`}>
                      <ProfileSection
                        title={gallery.title}
                        items={gallery.items}
                        collapsed={!!gallery.collapsed}
                        onToggleCollapse={() => toggleCollapse(gallery.id)}
                        highlightBgColor={galleryHighlightBgColor}
                        highlightTextColor={galleryHighlightTextColor}
                        onAdd={() => {
                          setActiveGalleryId(gallery.id);
                          setEditingGalleryItem(null);
                          setShowGalleryForm(true);
                        }}
                        onEdit={(item) => {
                          setActiveGalleryId(gallery.id);
                          setEditingGalleryItem(item);
                          setShowGalleryForm(true);
                        }}
                        onRename={() => setRenamingGalleryId(gallery.id)}
                      />
                    </SortableItem>
                  );
                }
                if (block.type === "image_banner") {
                  const banner = imageBanners.find((b) => b.id === block.id);
                  if (!banner) return null;
                  return (
                    <SortableItem id={`image_banner-${banner.id}`} key={`image_banner-${banner.id}`}>
                      <ImageBannerCard
                        title={banner.title}
                        image={banner.imageUrl}
                        url={banner.linkUrl}
                        onEdit={() => handleEditImageBanner(banner)}
                        onDelete={() => handleDeleteImageBanner(banner.id)}
                      />
                    </SortableItem>
                  );
                }
                if (block.type === "link") {
                  const link = links.find((l) => l.id === block.id);
                  if (!link) return null;
                  
                  return (
                    <SortableItem id={`link-${link.id}`} key={`link-${link.id}`}>
                      {link.url.includes("open.spotify.com") ? (
                        <SpotifyEmbedCard
                          url={link.url}
                          onEdit={() => handleEditLink(link)}
                          onDelete={() => handleDeleteLink(link.id)}
                        />
                      ) : link.url.includes("youtube.com") || link.url.includes("youtu.be") ? (
                        <YouTubeEmbedCard
                          url={link.url}
                          onEdit={() => handleEditLink(link)}
                          onDelete={() => handleDeleteLink(link.id)}
                        />
                      ) : (
                        <LinkCard
                          title={link.title}
                          url={link.url}
                          icon={link.icon}
                          image={link.image}
                          bgColor={link.bgColor}
                          hideUrl={Boolean(link.hideUrl) || link.url.includes("wa.me")}
                          onEdit={() => handleEditLink(link)}
                          onDelete={() => handleDeleteLink(link.id)}
                        />
                      )}
                    </SortableItem>
                  );
                }
                if (block.type === "form") {
                  const formResource = pageData.resources?.find((r) => r.id === block.id && r.type === "form");
                  if (!formResource || !formResource.form_data) return null;
                  return (
                    <SortableItem id={`form-${formResource.id}`} key={`form-${formResource.id}`}>
                      <FormResource
                        formId={formResource.form_data.id}
                        formData={formResource.form_data}
                        title={formResource.title}
                        cardBgColor={cardBgColor}
                        cardTextColor={cardTextColor}
                        onEdit={() => handleEditForm(formResource)}
                        onDelete={() => handleDeleteForm(formResource.id)}
                      />
                    </SortableItem>
                  );
                }
                return null;
              })}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (() => {
              const a = parseId(activeId);
              if (a.type === "gallery") {
                const gallery = galleries.find((g) => g.id === a.raw);
                if (!gallery) return null;
                return (
                  <Card className="p-4 bg-white shadow-card border-0 rounded-3xl w-[640px] max-w-[90vw]">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground truncate">{gallery.title}</span>
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Card>
                );
              }
              if (a.type === "image_banner") {
                const banner = imageBanners.find((b) => b.id === a.raw);
                if (!banner) return null;
                return (
                  <div className="w-[640px] max-w-[90vw]">
                    <ImageBannerCard
                      title={banner.title}
                      image={banner.imageUrl}
                      url={banner.linkUrl}
                    />
                  </div>
                );
              }
              if (a.type === "link") {
                const link = links.find((l) => l.id === a.raw);
                if (!link) return null;
                return (
                  <div className="w-[640px] max-w-[90vw]">
                    <LinkCard
                      title={link.title}
                      url={link.url}
                      icon={link.icon}
                      image={link.image}
                      bgColor={link.bgColor}
                      hideUrl={Boolean(link.hideUrl) || link.url.includes("wa.me")}
                    />
                  </div>
                );
              }
              if (a.type === "form") {
                const formResource = pageData.resources?.find((r) => r.id === a.raw && r.type === "form");
                if (!formResource || !formResource.form_data) return null;
                return (
                  <div className="w-[640px] max-w-[90vw]">
                    <FormResource
                      formId={formResource.form_data.id}
                      formData={formResource.form_data}
                      title={formResource.title}
                      cardBgColor={cardBgColor}
                      cardTextColor={cardTextColor}
                    />
                  </div>
                );
              }
              return null;
            })() : null}
          </DragOverlay>
        </DndContext>
        
        {/* Lista das redes sociais */}

        {Object.keys(socials).length > 0 && socialsDisplayMode === "bottom" && (
          <div className="flex items-center justify-center gap-3 mt-3">
            {SOCIAL_ORDER.filter((p) => Boolean(socials[p])).map((p) => (
              <div key={p} className="w-9 h-9 rounded-full bg-white text-white flex items-center justify-center shadow-sm">
                <img src={socialIconsMap[p]} alt={p} className="w-5 h-5" />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setShowSocialsForm(true)}
              className="w-9 h-9 rounded-full bg-white text-foreground flex items-center justify-center shadow-sm border border-border"
              aria-label="Editar redes sociais"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        )}


        {/* As galerias são renderizadas acima, cada uma com seus itens */}

        {/* Pro Features */}
        <ProFeatures backgroundColor={backgroundColor} />

        {/* Create New Page Button */}
        <Button 
          variant="outline" 
          className={`w-full h-14 bg-white/20 text-base font-medium ${
            backgroundColor && isLightColor(backgroundColor) 
              ? 'text-black border-black/30 hover:bg-black/10' 
              : 'text-white border-white/30 hover:bg-white/30'
          }`}
        >
          Criar nova página  Pro ⚡
        </Button>

        {/* View Page Button */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm md:bottom-6 md:left-auto md:right-6 md:translate-x-0 md:w-auto pb-[env(safe-area-inset-bottom)]">
          <Button 
            className="w-full md:w-auto justify-center bg-gradient-to-r from-[#00c6a9] via-[#00d4b8] to-[#03816e] bg-[length:200%_100%] text-white shadow-lg gap-2 animate-gradient-x transition-all hover:shadow-xl hover:scale-105"
            size="lg"
            onClick={() => {
              if (username) {
                window.open(`/${username}`, '_blank');
              } else {
                toast({
                  title: "Aguarde...",
                  description: "Carregando suas informações.",
                });
              }
            }}
          >
            <img src={eyeIcon} alt="" className="w-5 h-5" />
            Ver minha página
          </Button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default MainContent;