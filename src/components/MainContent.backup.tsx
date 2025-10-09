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

const MainContent = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  const [showSpotifyForm, setShowSpotifyForm] = useState(false);
  const [showYouTubeForm, setShowYouTubeForm] = useState(false);
  const [showImageBannerForm, setShowImageBannerForm] = useState(false);
  const [showSocialsForm, setShowSocialsForm] = useState(false);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [renamingGalleryId, setRenamingGalleryId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string | null>("#000000");
  const [showEditHeader, setShowEditHeader] = useState(false);
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [socialsDisplayMode, setSocialsDisplayMode] = useState<"bottom" | "top">("bottom");
  // Ordem unificada de blocos (galeria e link)
  const [blocksOrder, setBlocksOrder] = useState<Array<{ type: "gallery" | "link"; id: string }>>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sincroniza blocksOrder com dados atuais (inicializa, adiciona faltantes e remove obsoletos)
  useEffect(() => {
    setBlocksOrder((prev) => {
      let next = prev;

      // Inicializa quando vazio, preservando a ordem antiga (galerias em cima, depois links)
      if (prev.length === 0 && (galleries.length > 0 || links.length > 0)) {
        next = [
          ...galleries.map((g) => ({ type: "gallery" as const, id: g.id })),
          ...links.map((l) => ({ type: "link" as const, id: l.id })),
        ];
      } else {
        // Adiciona entradas faltantes ao final
        const known = new Set(prev.map((b) => `${b.type}-${b.id}`));
        const missingG = galleries
          .filter((g) => !known.has(`gallery-${g.id}`))
          .map((g) => ({ type: "gallery" as const, id: g.id }));
        const missingL = links
          .filter((l) => !known.has(`link-${l.id}`))
          .map((l) => ({ type: "link" as const, id: l.id }));
        if (missingG.length || missingL.length) {
          next = [...prev, ...missingG, ...missingL];
        }
      }

      // Remove referências a itens que não existem mais
      const galleryIds = new Set(galleries.map((g) => g.id));
      const linkIds = new Set(links.map((l) => l.id));
      const cleaned = next.filter((b) => (b.type === "gallery" ? galleryIds.has(b.id) : linkIds.has(b.id)));
      if (cleaned.length !== next.length) {
        next = cleaned;
      }
      return next;
    });
  }, [galleries, links]);

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
    return { type: "unknown" as const, raw: id };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const a = parseId(String(active.id));
    const o = parseId(String(over.id));
    // Reordenamos no nível de blocksOrder para permitir mistura de tipos
    const from = blocksOrder.findIndex((b) => b.type === a.type && b.id === a.raw);
    const to = blocksOrder.findIndex((b) => b.type === o.type && b.id === o.raw);
    if (from !== -1 && to !== -1 && from !== to) {
      setBlocksOrder((prev) => arrayMove(prev, from, to));
    }
    setActiveId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveId(id);
    const a = parseId(id);
    // Ao iniciar arraste de galeria, colapsar se estiver expandida
    if (a.type === "gallery") {
      setGalleries((prev) => prev.map((g) => (g.id === a.raw ? { ...g, collapsed: true } : g)));
    }
  };

  const handleSelectResource = (resource: any) => {
    if (resource.id === "link-button") {
      setShowLinkForm(true);
    }
    if (resource.id === "gallery") {
      // Adiciona um novo QUADRO de galeria (container) vazio
      const newGallery: Gallery = {
        id: Date.now().toString(),
        title: `Galeria ${galleries.length + 1}`,
        items: [],
        collapsed: false,
      };
      setGalleries((prev) => [...prev, newGallery]);
      setBlocksOrder((prev) => [...prev, { type: "gallery", id: newGallery.id }]);
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
    // Handle other resource types here in the future
  };

  const handleAddLink = (linkData: { title: string; url: string; icon?: string; image?: string; bgColor?: string; hideUrl?: boolean }) => {
    const newLink: Link = {
      id: Date.now().toString(),
      ...linkData,
    };
    setLinks((prev) => [...prev, newLink]);
    setBlocksOrder((prev) => [...prev, { type: "link", id: newLink.id }]);
  };

  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter(link => link.id !== id));
    setBlocksOrder((prev) => prev.filter((b) => !(b.type === "link" && b.id === id)));
  };

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    if (link.url.includes("wa.me")) {
      setShowWhatsAppForm(true);
    } else if (link.url.includes("open.spotify.com")) {
      setShowSpotifyForm(true);
    } else if (link.url.includes("youtube.com") || link.url.includes("youtu.be")) {
      setShowYouTubeForm(true);
    } else if (link.image && link.image.startsWith("data:image")) {
      setShowImageBannerForm(true);
    } else {
      setShowLinkForm(true);
    }
  };

  const handleUpdateLink = (id: string, data: { title: string; url: string; icon?: string; image?: string; bgColor?: string; hideUrl?: boolean }) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
    setEditingLink(null);
    setShowLinkForm(false);
    setShowWhatsAppForm(false);
  };

  return (
    <div
      className={`flex-1 overflow-hidden flex flex-col min-h-0 ${backgroundColor ? '' : 'bg-gradient-background'}`}
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
            className="w-full sm:w-auto gap-2 rounded-full hover:bg-primary"
            onClick={() => setShowCustomization(true)}
          >
            🎨 Cores
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto gap-2 rounded-full hover:bg-primary"
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
          onSave={({ socials: s, displayMode }) => {
            setSocials(s);
            setSocialsDisplayMode(displayMode);
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
            setEditingLink(null);
          }}
          onAddLink={handleAddLink}
          onUpdateLink={handleUpdateLink}
          initialLink={
            editingLink && editingLink.image && editingLink.image.startsWith("data:image")
              ? { id: editingLink.id, title: editingLink.title, url: editingLink.url, image: editingLink.image, hideUrl: true }
              : undefined
          }
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
          onAddItem={(item) => {
            if (!activeGalleryId) return;
            const itemWithId = { ...item, id: Date.now().toString() };
            setGalleries((prev) =>
              prev.map((g) =>
                g.id === activeGalleryId ? { ...g, items: [...g.items, itemWithId] } : g,
              ),
            );
          }}
          onUpdateItem={(item) => {
            if (!activeGalleryId) return;
            setGalleries((prev) =>
              prev.map((g) =>
                g.id === activeGalleryId
                  ? { ...g, items: g.items.map((it) => (it.id === item.id ? { ...it, ...item } : it)) }
                  : g,
              ),
            );
          }}
          onDeleteItem={(id) => {
            if (!activeGalleryId) return;
            setGalleries((prev) =>
              prev.map((g) =>
                g.id === activeGalleryId ? { ...g, items: g.items.filter((it) => it.id !== id) } : g,
              ),
            );
            setShowGalleryForm(false);
            setEditingGalleryItem(null);
            setActiveGalleryId(null);
          }}
        />

        {/* Gallery Rename Dialog */}
        <GalleryRenameDialog
          open={!!renamingGalleryId}
          initialTitle={galleries.find((g) => g.id === renamingGalleryId)?.title || ""}
          onClose={() => setRenamingGalleryId(null)}
          onSave={(newTitle) => {
            if (!renamingGalleryId) return;
            setGalleries((prev) => prev.map((g) => (g.id === renamingGalleryId ? { ...g, title: newTitle } : g)));
            setRenamingGalleryId(null);
          }}
          onDelete={() => {
            if (!renamingGalleryId) return;
            setGalleries((prev) => prev.filter((g) => g.id !== renamingGalleryId));
            setBlocksOrder((prev) => prev.filter((b) => !(b.type === "gallery" && b.id === renamingGalleryId)));
            setRenamingGalleryId(null);
          }}
        />
        
        {/* Customization Modal */}
        <CustomizationModal 
          open={showCustomization}
          onClose={() => setShowCustomization(false)}
          onSelectBackground={(color) => setBackgroundColor(color)}
          currentBackground={backgroundColor}
        />

        {/* Edit Header Modal */}
        <EditHeaderForm open={showEditHeader} onClose={() => setShowEditHeader(false)} />

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
                        onToggleCollapse={() =>
                          setGalleries((prev) =>
                            prev.map((g) => (g.id === gallery.id ? { ...g, collapsed: !g.collapsed } : g)),
                          )
                        }
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
                if (block.type === "link") {
                  const link = links.find((l) => l.id === block.id);
                  if (!link) return null;
                  return (
                    <SortableItem id={`link-${link.id}`} key={`link-${link.id}`}>
                      {link.image && link.image.startsWith("data:image") ? (
                        <ImageBannerCard
                          title={link.title}
                          image={link.image}
                          url={link.url}
                          onEdit={() => handleEditLink(link)}
                          onDelete={() => handleDeleteLink(link.id)}
                        />
                      ) : link.url.includes("open.spotify.com") ? (
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
        <ProFeatures />

        {/* Create New Page Button */}
        <Button 
          variant="outline" 
          className="w-full h-14 bg-white/20 border-white/30 text-white hover:bg-white/30 text-base font-medium"
        >
          Criar nova página  Pro ⚡
        </Button>

        {/* View Page Button */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm md:bottom-6 md:left-auto md:right-6 md:translate-x-0 md:w-auto pb-[env(safe-area-inset-bottom)]">
          <Button 
            className="w-full md:w-auto justify-center bg-gradient-primary text-white shadow-lg gap-2"
            size="lg"
            onClick={() => window.open('/preview', '_blank')}
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