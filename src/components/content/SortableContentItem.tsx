import type { CSSProperties, ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

/**
 * SortableContentItem - Item individual arrastável
 * Responsabilidade única: Tornar um item arrastável com handle visual
 */

interface SortableContentItemProps {
  id: string;
  children: ReactNode;
}

const SortableContentItem = ({ id, children }: SortableContentItemProps) => {
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
};

export default SortableContentItem;
