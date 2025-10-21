import { useState } from "react";
import { GalleryItem } from "@/components/GalleryItemForm";

interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string;
  image?: string;
  bgColor?: string;
  hideUrl?: boolean;
}

interface ImageBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
}

interface ModalState<T = any> {
  open: boolean;
  editing: T | null;
}

export interface ModalsState {
  linkForm: ModalState<Link>;
  whatsApp: ModalState<Link>;
  socials: ModalState;
  spotify: ModalState<Link>;
  youtube: ModalState<Link>;
  twitch: ModalState<Link>;
  imageBanner: ModalState<ImageBanner>;
  galleryItem: ModalState<GalleryItem>;
  galleryRename: ModalState<{ id: string; title: string }>;
  customization: ModalState;
  editHeader: ModalState;
  addForm: ModalState<any>;
}

export const useModals = () => {
  const [modals, setModals] = useState<ModalsState>({
    linkForm: { open: false, editing: null },
    whatsApp: { open: false, editing: null },
    socials: { open: false, editing: null },
    spotify: { open: false, editing: null },
    youtube: { open: false, editing: null },
    twitch: { open: false, editing: null },
    imageBanner: { open: false, editing: null },
    galleryItem: { open: false, editing: null },
    galleryRename: { open: false, editing: null },
    customization: { open: false, editing: null },
    editHeader: { open: false, editing: null },
    addForm: { open: false, editing: null },
  });

  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(null);

  const openModal = <T = any>(modalName: keyof ModalsState, editingData?: T) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { open: true, editing: editingData || null }
    }));
  };

  const closeModal = (modalName: keyof ModalsState) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { open: false, editing: null }
    }));
  };

  const closeAllModals = () => {
    setModals({
      linkForm: { open: false, editing: null },
      whatsApp: { open: false, editing: null },
      socials: { open: false, editing: null },
      spotify: { open: false, editing: null },
      youtube: { open: false, editing: null },
      twitch: { open: false, editing: null },
      imageBanner: { open: false, editing: null },
      galleryItem: { open: false, editing: null },
      galleryRename: { open: false, editing: null },
      customization: { open: false, editing: null },
      editHeader: { open: false, editing: null },
      addForm: { open: false, editing: null },
    });
    setActiveGalleryId(null);
  };

  // Helpers específicos para diferentes tipos de modal
  const openLinkForm = (link?: Link) => {
    if (link?.url.includes("wa.me")) {
      openModal("whatsApp", link);
    } else if (link?.url.includes("open.spotify.com")) {
      openModal("spotify", link);
    } else if (link?.url.includes("youtube.com") || link?.url.includes("youtu.be")) {
      openModal("youtube", link);
    } else if (link?.url.includes("twitch.tv") || link?.url.includes("player.twitch.tv")) {
      openModal("twitch", link);
    } else {
      openModal("linkForm", link);
    }
  };

  const openGalleryItemForm = (galleryId: string, item?: GalleryItem) => {
    setActiveGalleryId(galleryId);
    openModal("galleryItem", item);
  };

  const closeGalleryItemForm = () => {
    closeModal("galleryItem");
    setActiveGalleryId(null);
  };

  return {
    modals,
    activeGalleryId,
    openModal,
    closeModal,
    closeAllModals,
    openLinkForm,
    openGalleryItemForm,
    closeGalleryItemForm,
    setActiveGalleryId,
  };
};
