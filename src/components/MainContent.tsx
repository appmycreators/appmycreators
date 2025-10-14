import { useEffect, useState } from "react";
import ResourceSelector from "./ResourceSelector";
import { usePage } from "@/hooks/usePage";
import { usePageSync } from "@/hooks/usePageSync";
import { useGallerySync } from "@/hooks/useGallerySync";
import { useSocialSync } from "@/hooks/useSocialSync";
import { usePageSettings } from "@/hooks/usePageSettings";
import { useGalleryColors } from "@/hooks/useGalleryColors";
import { useImageBannerSync } from "@/hooks/useImageBannerSync";
import { useFormSync } from "@/hooks/useFormSync";
import { useToast } from "@/hooks/use-toast";
import ProFeatures from "./ProFeatures";
import ImageBannerCard from "./ImageBannerCard";
import { FormResource } from "./FormResource";

// Novos hooks customizados
import { useDragAndDrop } from "@/hooks/content/useDragAndDrop";
import { useModals } from "@/hooks/modals/useModals";
import { useContentHandlers } from "@/hooks/content/useContentHandlers";
import { useBlocksOrder } from "@/hooks/content/useBlocksOrder";

// Componentes de layout
import LoadingState from "./layout/LoadingState";
import PageActions from "./layout/PageActions";
import ViewPageButton from "./layout/ViewPageButton";
import CreateNewPageButton from "./layout/CreateNewPageButton";
import SocialNetworksSection from "./social/SocialNetworksSection";
import ModalsContainer from "./modals/ModalsContainer";
import DraggableContentList from "./content/DraggableContentList";



const MainContent = () => {
  // Hooks principais
  const { pageData, loading: pageLoading } = usePage();
  const [slug, setSlug] = useState<string>('');
  const { links, loading: linksLoading } = usePageSync();
  const { galleries, toggleCollapse, loading: galleriesLoading } = useGallerySync();
  const { imageBanners, loading: imageBannersLoading } = useImageBannerSync();
  const { loading: formLoading } = useFormSync();
  const { socials, socialsDisplayMode, loading: socialsLoading } = useSocialSync();
  const { toast } = useToast();

  // Estados locais para renomeação de galeria
  const [renamingGalleryId, setRenamingGalleryId] = useState<string | null>(null);

  // Hooks customizados para lógica complexa
  const {
    blocksOrder,
    setBlocksOrder,
    activeId,
    sensors,
    parseId,
    handleDragStart,
    handleDragEnd,
  } = useDragAndDrop();

  const {
    modals,
    activeGalleryId,
    openModal,
    closeModal,
    openLinkForm,
    openGalleryItemForm,
    closeGalleryItemForm,
  } = useModals();

  const {
    handleSelectResource,
    handleAddLink,
    handleUpdateLink,
    handleDeleteLink,
    handleAddImageBanner,
    handleUpdateImageBanner,
    handleDeleteImageBanner,
    handleAddGalleryItem,
    handleUpdateGalleryItem,
    handleDeleteGalleryItem,
    handleRenameGallery,
    handleDeleteGallery,
    handleEditForm,
    handleDeleteForm,
    handleSaveSocials,
    handleDeleteAllSocials,
    handleToggleVisibility,
  } = useContentHandlers(
    setBlocksOrder,
    openModal,
    closeModal,
    openGalleryItemForm,
    setRenamingGalleryId
  );

  // Sincronização da ordem dos blocos
  useBlocksOrder(galleries, links, imageBanners, setBlocksOrder);
  
  useEffect(() => {
    // Usar o slug da página atual ao invés do username
    if (pageData.page?.slug) {
      setSlug(pageData.page.slug);
    }
  }, [pageData.page?.slug]);

  const { backgroundColor, cardBgColor, cardTextColor, loading: settingsLoading } = usePageSettings();
  const { galleryHighlightBgColor, galleryHighlightTextColor } = useGalleryColors();

  // Loading state
  if (pageLoading || linksLoading || galleriesLoading || socialsLoading || settingsLoading || imageBannersLoading || formLoading) {
    return <LoadingState />;
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
        <PageActions 
          onCustomization={() => openModal("customization")}
          onEditHeader={() => openModal("editHeader")}
        />

        {/* Resource Selector */}
        <ResourceSelector onSelectResource={handleSelectResource} />
        
        {/* Drag-and-Drop: Lista unificada de conteúdo */}
        <DraggableContentList
          blocksOrder={blocksOrder}
          activeId={activeId}
          sensors={sensors}
          parseId={parseId}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          galleryHighlightBgColor={galleryHighlightBgColor}
          galleryHighlightTextColor={galleryHighlightTextColor}
          cardBgColor={cardBgColor}
          cardTextColor={cardTextColor}
          onOpenGalleryItemForm={openGalleryItemForm}
          onRenameGallery={setRenamingGalleryId}
          onEditLink={openLinkForm}
          onDeleteLink={handleDeleteLink}
          onEditBanner={(banner) => openModal("imageBanner", banner)}
          onDeleteBanner={handleDeleteImageBanner}
          onEditForm={handleEditForm}
          onDeleteForm={handleDeleteForm}
        />
        
        {/* Lista das redes sociais */}
        <SocialNetworksSection 
          socials={socials}
          socialsDisplayMode={socialsDisplayMode}
          onEdit={() => openModal("socials")}
        />

        {/* Pro Features */}
        <ProFeatures backgroundColor={backgroundColor} />

        {/* Create New Page Button */}
        <CreateNewPageButton backgroundColor={backgroundColor} />

        {/* View Page Button */}
        <ViewPageButton slug={slug} />
      </div>
    </div>

    {/* Modals Container */}
    <ModalsContainer
      modals={modals}
      activeGalleryId={activeGalleryId}
      renamingGalleryId={renamingGalleryId}
      galleries={galleries}
      socials={socials}
      socialsDisplayMode={socialsDisplayMode}
      closeModal={closeModal}
      closeGalleryItemForm={closeGalleryItemForm}
      setRenamingGalleryId={setRenamingGalleryId}
      handleAddLink={handleAddLink}
      handleUpdateLink={handleUpdateLink}
      handleAddImageBanner={handleAddImageBanner}
      handleUpdateImageBanner={handleUpdateImageBanner}
      handleAddGalleryItem={handleAddGalleryItem}
      handleUpdateGalleryItem={handleUpdateGalleryItem}
      handleDeleteGalleryItem={handleDeleteGalleryItem}
      handleRenameGallery={handleRenameGallery}
      handleDeleteGallery={handleDeleteGallery}
      handleSaveSocials={handleSaveSocials}
      handleDeleteAllSocials={handleDeleteAllSocials}
      handleToggleVisibility={handleToggleVisibility}
    />
  </div>
  );
};

export default MainContent;
