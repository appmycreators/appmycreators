import { useToast } from "@/hooks/use-toast";
import { usePageSettings } from "@/hooks/usePageSettings";
import { useGalleryColors } from "@/hooks/useGalleryColors";
import { useSocialSync } from "@/hooks/useSocialSync";
import { useGallerySync } from "@/hooks/useGallerySync";
import { ModalsState } from "@/hooks/modals/useModals";

// Modal Components
import LinkForm from "../LinkForm";
import WhatsAppForm from "../WhatsAppForm";
import SocialNetworksForm from "../SocialNetworksForm";
import SpotifyForm from "../SpotifyForm";
import YouTubeForm from "../YouTubeForm";
import ImageBannerForm from "../ImageBannerForm";
import GalleryItemForm from "../GalleryItemForm";
import GalleryRenameDialog from "../GalleryRenameDialog";
import CustomizationModal from "../CustomizationModal";
import EditHeaderForm from "../EditHeaderForm";
import { AddFormModal } from "../AddFormModal";

/**
 * ModalsContainer - Container centralizado para todos os modais
 * Responsabilidade única: Gerenciar renderização e props de todos os modais
 */

interface ModalsContainerProps {
  modals: ModalsState;
  activeGalleryId: string | null;
  renamingGalleryId: string | null;
  galleries: any[];
  socials: Record<string, string>;
  socialsDisplayMode: 'top' | 'bottom';
  closeModal: (modalName: keyof ModalsState) => void;
  closeGalleryItemForm: () => void;
  setRenamingGalleryId: (id: string | null) => void;
  handleAddLink: (linkData: any) => Promise<void>;
  handleUpdateLink: (id: string, data: any) => Promise<void>;
  handleAddImageBanner: (bannerData: any) => Promise<void>;
  handleUpdateImageBanner: (id: string, data: any) => Promise<void>;
  handleAddGalleryItem: (galleryId: string, item: any) => Promise<void>;
  handleUpdateGalleryItem: (galleryId: string, itemId: string, item: any) => Promise<void>;
  handleDeleteGalleryItem: (galleryId: string, itemId: string) => Promise<void>;
  handleRenameGallery: (galleryId: string, newTitle: string) => Promise<void>;
  handleDeleteGallery: (galleryId: string) => Promise<void>;
  handleSaveSocials: (socials: Record<string, string>, displayMode: 'top' | 'bottom') => Promise<void>;
  handleDeleteAllSocials: () => Promise<void>;
}

const ModalsContainer = ({
  modals,
  activeGalleryId,
  renamingGalleryId,
  galleries,
  socials,
  socialsDisplayMode,
  closeModal,
  closeGalleryItemForm,
  setRenamingGalleryId,
  handleAddLink,
  handleUpdateLink,
  handleAddImageBanner,
  handleUpdateImageBanner,
  handleAddGalleryItem,
  handleUpdateGalleryItem,
  handleDeleteGalleryItem,
  handleRenameGallery,
  handleDeleteGallery,
  handleSaveSocials,
  handleDeleteAllSocials,
}: ModalsContainerProps) => {
  const { toast } = useToast();
  
  // Hooks para configurações de cores
  const { 
    backgroundColor, 
    updateBackgroundColor, 
    cardBgColor, 
    cardTextColor, 
    updateCardBgColor, 
    updateCardTextColor, 
    headerNameColor, 
    headerBioColor, 
    updateHeaderNameColor, 
    updateHeaderBioColor, 
    socialIconBgColor, 
    socialIconColor, 
    updateSocialIconBgColor, 
    updateSocialIconColor 
  } = usePageSettings();
  
  const {
    galleryTitleColor,
    galleryContainerBgColor,
    galleryCardBgColor,
    galleryProductNameColor,
    galleryProductDescriptionColor,
    galleryButtonBgColor,
    galleryButtonTextColor,
    galleryPriceColor,
    galleryHighlightBgColor,
    galleryHighlightTextColor,
    updateGalleryTitleColor,
    updateGalleryContainerBgColor,
    updateGalleryCardBgColor,
    updateGalleryProductNameColor,
    updateGalleryProductDescriptionColor,
    updateGalleryButtonBgColor,
    updateGalleryButtonTextColor,
    updateGalleryPriceColor,
    updateGalleryHighlightBgColor,
    updateGalleryHighlightTextColor,
  } = useGalleryColors();

  return (
    <>
      {/* Link Form Modal */}
      <LinkForm 
        open={modals.linkForm.open}
        onClose={() => closeModal("linkForm")}
        onAddLink={handleAddLink}
        initialLink={modals.linkForm.editing}
        onUpdateLink={handleUpdateLink}
      />

      {/* WhatsApp Form Modal */}
      <WhatsAppForm
        open={modals.whatsApp.open}
        onClose={() => closeModal("whatsApp")}
        onAddLink={handleAddLink}
        initialLink={modals.whatsApp.editing}
        onUpdateLink={handleUpdateLink}
      />

      {/* Social Networks Modal */}
      <SocialNetworksForm
        open={modals.socials.open}
        onClose={() => closeModal("socials")}
        initialValues={socials}
        initialDisplayMode={socialsDisplayMode}
        onSave={(data) => handleSaveSocials(data.socials, data.displayMode)}
        onDelete={handleDeleteAllSocials}
      />

      {/* Spotify Form Modal */}
      <SpotifyForm
        open={modals.spotify.open}
        onClose={() => closeModal("spotify")}
        onAddLink={handleAddLink}
        onUpdateLink={handleUpdateLink}
        initialLink={modals.spotify.editing}
      />

      {/* YouTube Form Modal */}
      <YouTubeForm
        open={modals.youtube.open}
        onClose={() => closeModal("youtube")}
        onAddLink={handleAddLink}
        onUpdateLink={handleUpdateLink}
        initialLink={modals.youtube.editing}
      />

      {/* Image Banner Modal */}
      <ImageBannerForm
        open={modals.imageBanner.open}
        onClose={() => closeModal("imageBanner")}
        onAddImageBanner={handleAddImageBanner}
        onUpdateImageBanner={handleUpdateImageBanner}
        initialBanner={modals.imageBanner.editing}
      />

      {/* Gallery Item Modal */}
      <GalleryItemForm
        open={modals.galleryItem.open}
        onClose={closeGalleryItemForm}
        initialItem={modals.galleryItem.editing}
        onAddItem={(item) => activeGalleryId && handleAddGalleryItem(activeGalleryId, item)}
        onUpdateItem={(item) => activeGalleryId && item.id && handleUpdateGalleryItem(activeGalleryId, item.id, item)}
        onDeleteItem={(id) => activeGalleryId && handleDeleteGalleryItem(activeGalleryId, id)}
      />

      {/* Gallery Rename Dialog */}
      <GalleryRenameDialog
        open={!!renamingGalleryId}
        initialTitle={galleries.find((g) => g.id === renamingGalleryId)?.title || ""}
        onClose={() => setRenamingGalleryId(null)}
        onSave={(newTitle) => renamingGalleryId && handleRenameGallery(renamingGalleryId, newTitle)}
        onDelete={() => renamingGalleryId && handleDeleteGallery(renamingGalleryId)}
      />
      
      {/* Customization Modal */}
      <CustomizationModal 
        open={modals.customization.open}
        onClose={() => closeModal("customization")}
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
        onSelectGalleryContainerBgColor={async (color) => {
          await updateGalleryContainerBgColor(color);
          toast({
            title: "Cor atualizada!",
            description: "A cor de fundo da lista de produtos foi alterada.",
          });
        }}
        currentGalleryContainerBgColor={galleryContainerBgColor}
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
      <EditHeaderForm open={modals.editHeader.open} onClose={() => closeModal("editHeader")} />

      {/* Add Form Modal */}
      <AddFormModal
        open={modals.addForm.open}
        onClose={() => closeModal("addForm")}
        editingForm={modals.addForm.editing}
      />
    </>
  );
};

export default ModalsContainer;
