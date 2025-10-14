import { useState } from "react";
import { DragEndEvent, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useToast } from "@/hooks/use-toast";
import { ResourceService } from "@/services/supabaseService";

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

export interface BlockOrder {
  type: "gallery" | "link" | "image_banner" | "form";
  id: string;
}

export const useDragAndDrop = () => {
  const [blocksOrder, setBlocksOrder] = useState<BlockOrder[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveId(id);
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

  return {
    blocksOrder,
    setBlocksOrder,
    activeId,
    sensors,
    parseId,
    handleDragStart,
    handleDragEnd,
  };
};
