import { useState, useEffect } from "react";
import { Share, Menu, Home, Edit, Palette, BarChart3, Plus, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import ShareModal from "@/components/ShareModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const Topbar = () => {
  const [shareOpen, setShareOpen] = useState(false);
  const [username, setUsername] = useState<string>('');
  const { user } = useAuth();

  // Carregar username do usuário
  useEffect(() => {
    const loadUsername = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('usernames')
          .select('username')
          .eq('user_id', user.id)
          .single();
        
        if (data?.username) {
          setUsername(data.username);
        }
      }
    };
    
    loadUsername();
  }, [user?.id]);
  const menuItems = [
    { icon: Home, label: "Início", active: true },
    { icon: Edit, label: "Editar página" },
    { icon: Palette, label: "Customizar" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Plus, label: "Adicionar página", badge: "Pro" },
    { icon: Eye, label: "Ver minha página" },
    { icon: Settings, label: "Ajustes" },
  ];
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 bg-white border-b border-border h-14 sm:h-[81px]">
      {/* Mobile menu trigger */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 sm:w-80">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                  <span className="text-lg font-bold">MyCreators</span>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-2">
                <div className="space-y-1">
                  {menuItems.map((item, idx) => (
                    <Button
                      key={idx}
                      variant={item.active ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3 h-11"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary text-primary-foreground px-2 py-0.5 text-xs rounded-full">{item.badge}</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="p-4">
                <Button className="w-full" variant="default">
                  Seja PRO ⚡
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 hover:bg-primary hover:text-primary-foreground"
          onClick={() => setShareOpen(true)}
        >
          <Share className="w-4 h-4" />
          Compartilhar
        </Button>
      </div>
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} username={username} />
    </div>
  );
};

export default Topbar;
