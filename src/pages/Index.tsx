import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import Topbar from "@/components/ui/topbar";

const Index = () => {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <MainContent />
      </div>
    </div>
  );
};

export default Index;
