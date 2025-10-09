import PublicPage from "@/components/PublicPage";

// PublicProfile agora apenas renderiza PublicPage
// PublicPage carrega todos os dados internamente via usePublicPage hook
const PublicProfile = () => {
  return <PublicPage />;
};

export default PublicProfile;
