import { useToast } from "@/hooks/use-toast";
import { usePage } from "@/hooks/usePage";
import { usePageSync } from "@/hooks/usePageSync";
import { useGallerySync } from "@/hooks/useGallerySync";
import { useImageBannerSync } from "@/hooks/useImageBannerSync";
import { useFormSync } from "@/hooks/useFormSync";
import { useSocialSync } from "@/hooks/useSocialSync";
import { GalleryItem } from "@/components/GalleryItemForm";
import { BlockOrder } from "./useDragAndDrop";

interface LinkData {
  title: string;
  url: string;
  icon?: string;
  image?: string;
  bgColor?: string;
  hideUrl?: boolean;
}

interface ImageBannerData {
  title: string;
  imageUrl: string;
  linkUrl?: string;
}

export const useContentHandlers = (
  setBlocksOrder: React.Dispatch<React.SetStateAction<BlockOrder[]>>,
  openModal: (modalName: string, data?: any) => void,
  closeModal: (modalName: string) => void,
  openGalleryItemForm: (galleryId: string, item?: GalleryItem) => void,
  setRenamingGalleryId: (id: string | null) => void
) => {
  const { toast } = useToast();
  const { refreshPage } = usePage();
  const { addLink, updateLink, deleteLink } = usePageSync();
  const { 
    galleries, 
    addGallery, 
    updateGallery, 
    deleteGallery,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem
  } = useGallerySync();
  const { addImageBanner, updateImageBanner, deleteImageBanner } = useImageBannerSync();
  const { addForm, updateForm, deleteForm } = useFormSync();
  const { updateSocials, deleteAllSocials } = useSocialSync();

  // Resource Selection Handler
  const handleSelectResource = (resource: any) => {
    if (resource.id === "link-button") {
      openModal("linkForm");
    }
    if (resource.id === "gallery") {
      const title = `Galeria ${galleries.length + 1}`;
      addGallery(title)
        .then((resourceId) => {
          if (resourceId) {
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
      openModal("whatsApp");
    }
    if (resource.id === "social-networks") {
      openModal("socials");
    }
    if (resource.id === "spotify") {
      openModal("spotify");
    }
    if (resource.id === "youtube") {
      openModal("youtube");
    }
    if (resource.id === "image-section") {
      openModal("imageBanner");
    }
    if (resource.id === "form") {
      openModal("addForm");
    }
  };

  // Link Handlers
  const handleAddLink = async (linkData: LinkData) => {
    await addLink(linkData);
    await refreshPage();
  };

  const handleUpdateLink = async (id: string, data: LinkData) => {
    await updateLink(id, data);
    closeModal("linkForm");
    closeModal("whatsApp");
    closeModal("spotify");
    closeModal("youtube");
  };

  const handleDeleteLink = async (id: string) => {
    await deleteLink(id);
    setBlocksOrder((prev) => prev.filter((b) => !(b.type === "link" && b.id === id)));
    toast({
      title: "Link excluído!",
      description: "O link foi removido com sucesso.",
    });
  };

  // Image Banner Handlers
  const handleAddImageBanner = async (bannerData: ImageBannerData) => {
    await addImageBanner(bannerData);
    toast({
      title: "Imagem/Banner adicionado!",
      description: "Seu banner foi adicionado com sucesso.",
    });
  };

  const handleUpdateImageBanner = async (id: string, data: ImageBannerData) => {
    await updateImageBanner(id, data);
    closeModal("imageBanner");
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

  // Gallery Handlers
  const handleAddGalleryItem = async (galleryId: string, item: GalleryItem) => {
    await addGalleryItem(galleryId, item);
    toast({
      title: "Item adicionado!",
      description: "O item foi adicionado à galeria.",
    });
  };

  const handleUpdateGalleryItem = async (galleryId: string, itemId: string, item: GalleryItem) => {
    await updateGalleryItem(galleryId, itemId, item);
    toast({
      title: "Item atualizado!",
      description: "As alterações foram salvas.",
    });
  };

  const handleDeleteGalleryItem = async (galleryId: string, itemId: string) => {
    await deleteGalleryItem(galleryId, itemId);
    closeModal("galleryItem");
    toast({
      title: "Item deletado!",
      description: "O item foi removido da galeria.",
    });
  };

  const handleRenameGallery = async (galleryId: string, newTitle: string) => {
    await updateGallery(galleryId, newTitle);
    setRenamingGalleryId(null);
    toast({
      title: "Galeria renomeada!",
      description: "O título foi atualizado.",
    });
  };

  const handleDeleteGallery = async (galleryId: string) => {
    await deleteGallery(galleryId);
    setBlocksOrder((prev) => prev.filter((b) => !(b.type === "gallery" && b.id === galleryId)));
    setRenamingGalleryId(null);
    toast({
      title: "Galeria deletada!",
      description: "A galeria foi removida.",
    });
  };

  // Form Handlers
  const handleEditForm = (formResource: any) => {
    openModal("addForm", {
      id: formResource.id,
      title: formResource.title,
      form_data: formResource.form_data
    });
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

  // Social Networks Handlers
  const handleSaveSocials = async (socials: Record<string, string>, displayMode: 'top' | 'bottom') => {
    await updateSocials(socials, displayMode);
    toast({
      title: "Redes sociais salvas!",
      description: "Suas redes sociais foram atualizadas.",
    });
  };

  const handleDeleteAllSocials = async () => {
    await deleteAllSocials();
    toast({
      title: "Redes sociais excluídas!",
      description: "Todas as redes sociais foram removidas.",
    });
  };

  return {
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
  };
};
