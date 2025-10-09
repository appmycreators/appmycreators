/**
 * MainContentWithSync - Exemplo de integração do MainContent com Supabase
 * 
 * Este arquivo demonstra como integrar o MainContent existente com o sistema
 * de sincronização do Supabase usando os hooks usePage e usePageSync.
 * 
 * Para usar este componente em vez do MainContent original:
 * 1. Renomeie o MainContent.tsx atual para MainContent.backup.tsx
 * 2. Renomeie este arquivo para MainContent.tsx
 * 3. Ou importe este componente diretamente no Index.tsx
 */

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
import SaveIndicator from "./SaveIndicator";
import { usePage } from "@/hooks/usePage";
import { usePageSync } from "@/hooks/usePageSync";
import eyeIcon from "@/assets/ui/eye.svg";

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

const MainContentWithSync = () => {
  // Hook principal de página (carrega dados do Supabase)
  const { pageData, loading: pageLoading, updateSettings } = usePage();
  
  // Hook de sincronização de links (auto-save)
  const {
    links,
    loading: linksLoading,
    saveStatus,
    lastSaved,
    saveError,
    addLink,
    updateLink,
    deleteLink,
    reorderLinks,
  } = usePageSync();

  // Estados locais para UI
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string | null>("#000000");

  // Atualizar cor de fundo quando page settings carregarem
  useEffect(() => {
    if (pageData.settings?.background_color) {
      setBackgroundColor(pageData.settings.background_color);
    }
  }, [pageData.settings]);

  // Configuração do DnD
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const activeIndex = links.findIndex((l) => l.id === active.id);
    const overIndex = links.findIndex((l) => l.id === over.id);

    if (activeIndex !== -1 && overIndex !== -1) {
      const reordered = arrayMove(links, activeIndex, overIndex);
      await reorderLinks(reordered);
    }

    setActiveId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleSelectResource = (resource: any) => {
    if (resource.id === "link-button") {
      setShowLinkForm(true);
      setEditingLink(null);
    }
    // TODO: Adicionar outros tipos de recursos
  };

  const handleAddLink = async (linkData: {
    title: string;
    url: string;
    icon?: string;
    image?: string;
    bgColor?: string;
    hideUrl?: boolean;
  }) => {
    await addLink(linkData);
    setShowLinkForm(false);
  };

  const handleEditLink = (link: any) => {
    setEditingLink(link);
    setShowLinkForm(true);
  };

  const handleUpdateLink = async (
    id: string,
    data: { title: string; url: string; icon?: string; image?: string; bgColor?: string; hideUrl?: boolean }
  ) => {
    await updateLink(id, data);
    setEditingLink(null);
    setShowLinkForm(false);
  };

  const handleDeleteLink = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este link?")) {
      await deleteLink(id);
    }
  };

  // Loading state
  if (pageLoading || linksLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando página...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 overflow-hidden flex flex-col min-h-0 ${backgroundColor ? '' : 'bg-gradient-background'}`}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      {/* Header com Save Indicator */}
      <div className="flex-shrink-0 bg-white border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Editar Página {pageData.username ? `@${pageData.username}` : ''}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {links.length} {links.length === 1 ? 'link' : 'links'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Save Indicator */}
            <SaveIndicator status={saveStatus} lastSaved={lastSaved} error={saveError} />

            {/* Preview Button */}
            <Button variant="outline" size="sm" asChild>
              <a href="/preview" target="_blank" rel="noopener noreferrer">
                <img src={eyeIcon} alt="Preview" className="w-4 h-4 mr-2" />
                Preview
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Resource Selector */}
          <ResourceSelector onSelect={handleSelectResource} />

          {/* Links with Drag and Drop */}
          {links.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {links.map((link) => (
                    <SortableItem key={link.id} id={link.id}>
                      <LinkCard
                        link={link}
                        onEdit={() => handleEditLink(link)}
                        onDelete={() => handleDeleteLink(link.id)}
                      />
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeId && (
                  <div className="opacity-90">
                    {(() => {
                      const link = links.find((l) => l.id === activeId);
                      return link ? <LinkCard link={link} onEdit={() => {}} onDelete={() => {}} /> : null;
                    })()}
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}

          {/* Empty State */}
          {links.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhum link adicionado ainda. Clique em um recurso acima para começar!
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Link Form Modal */}
      {showLinkForm && (
        <LinkForm
          link={editingLink}
          onSave={editingLink ? (data) => handleUpdateLink(editingLink.id, data) : handleAddLink}
          onClose={() => {
            setShowLinkForm(false);
            setEditingLink(null);
          }}
        />
      )}
    </div>
  );
};

export default MainContentWithSync;
