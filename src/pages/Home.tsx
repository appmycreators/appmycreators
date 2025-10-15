import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import Topbar from "@/components/ui/topbar";

const Home = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {!isMobile && <Sidebar />}
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
        {isMobile && <Topbar />}
        
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-8 text-center"
          >
            <img 
              src="/images/logo.png" 
              alt="MyCreators Logo" 
              className="w-64 h-64 object-contain"
            />
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Em desenvolvimento...
            </h1>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Home;
