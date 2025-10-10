import PublicPageOptimized from "@/components/PublicPage";

// PublicProfile agora apenas renderiza PublicPage
// PublicPage carrega todos os dados internamente via usePublicPage hook
const PublicProfile = () => {
  return <PublicPageOptimized />;
};

export default PublicProfile;
