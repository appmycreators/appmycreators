import {
  DndContext,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BlockOrder } from "@/hooks/content/useDragAndDrop";
import SortableContentItem from "./SortableContentItem";
import ContentBlock from "./ContentBlock";
import DragPreview from "./DragPreview";

/**
 * DraggableContentList - Container principal do sistema drag & drop
 * Responsabilidade única: Gerenciar drag & drop de todos os blocos de conteúdo
 */

interface DraggableContentListProps {
  blocksOrder: BlockOrder[];
  activeId: string | null;
  sensors: any;
  parseId: (id: string) => { type: string; raw: string };
  handleDragStart: (event: any) => void;
  handleDragEnd: (event: any) => void;
  galleryHighlightBgColor?: string;
  galleryHighlightTextColor?: string;
  cardBgColor?: string;
  cardTextColor?: string;
  onOpenGalleryItemForm: (galleryId: string, item?: any) => void;
  onRenameGallery: (galleryId: string) => void;
  onEditLink: (link: any) => void;
  onDeleteLink: (linkId: string) => void;
  onEditBanner: (banner: any) => void;
  onDeleteBanner: (bannerId: string) => void;
  onEditForm: (formResource: any) => void;
  onDeleteForm: (formId: string) => void;
}

const DraggableContentList = ({
  blocksOrder,
  activeId,
  sensors,
  parseId,
  handleDragStart,
  handleDragEnd,
  galleryHighlightBgColor,
  galleryHighlightTextColor,
  cardBgColor,
  cardTextColor,
  onOpenGalleryItemForm,
  onRenameGallery,
  onEditLink,
  onDeleteLink,
  onEditBanner,
  onDeleteBanner,
  onEditForm,
  onDeleteForm,
}: DraggableContentListProps) => {

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocksOrder.map((b) => `${b.type}-${b.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {blocksOrder.map((block) => (
            <SortableContentItem 
              id={`${block.type}-${block.id}`} 
              key={`${block.type}-${block.id}`}
            >
              <ContentBlock
                block={block}
                galleryHighlightBgColor={galleryHighlightBgColor}
                galleryHighlightTextColor={galleryHighlightTextColor}
                cardBgColor={cardBgColor}
                cardTextColor={cardTextColor}
                onOpenGalleryItemForm={onOpenGalleryItemForm}
                onRenameGallery={onRenameGallery}
                onEditLink={onEditLink}
                onDeleteLink={onDeleteLink}
                onEditBanner={onEditBanner}
                onDeleteBanner={onDeleteBanner}
                onEditForm={onEditForm}
                onDeleteForm={onDeleteForm}
              />
            </SortableContentItem>
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay>
        <DragPreview 
          activeId={activeId}
          parseId={parseId}
          cardBgColor={cardBgColor}
          cardTextColor={cardTextColor}
        />
      </DragOverlay>
    </DndContext>
  );
};

export default DraggableContentList;
