import { 
  Home, 
  Palette, 
  DollarSign, 
  BarChart3, 
  Plus, 
  Settings,
  LogOut,
  User,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import closeSidebarIcon from "@/assets/ui/close-sidebar-icon.svg";
const Sidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const menuItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Palette, label: "Customizar", path: "/pages" },
    { icon: FileText, label: "Leads", path: "/leads" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Plus, label: "Adicionar página", badge: "Pro" },
    { icon: Settings, label: "Ajustes" },
  ];
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Até logo!",
        description: "Você saiu da sua conta.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Não foi possível sair",
        description: error instanceof Error ? error.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={`hidden md:flex h-screen bg-white border-r border-border flex-col overflow-hidden ${collapsed ? "w-16" : "w-64"}`}
      style={{ transition: "width 300ms ease-in-out" }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
          <img
            src="/images/logo.png"
            alt="Logo"
            className="w-8 h-8 object-contain"
            loading="lazy"
          />
          {!collapsed && <span className="text-xl font-bold text-foreground">MyCreators</span>}
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div className="px-4 py-3 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full ${collapsed ? "justify-center p-2" : "justify-start"} h-auto hover:bg-muted transition-colors`}
              >
                <div className={`flex items-center gap-3 ${collapsed ? "" : "w-full"}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00c6a9] to-[#03816e] flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  {!collapsed && (
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.user_metadata?.username || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = '#'} className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '#'} className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Menu Items */}
      <div className={`flex-1 p-4 space-y-1 ${collapsed ? "px-2" : ""}`}>
        {menuItems.map((item, index) => {
          // "Customizar" fica ativo tanto em "/editor" quanto em "/pages"
          const isActive = item.path 
            ? (item.path === "/pages" 
                ? (location.pathname === "/editor" || location.pathname === "/pages")
                : location.pathname === item.path)
            : false;
          
          // Itens sem path não devem navegar
          const shouldNavigate = Boolean(item.path);
          
          return (
            <div key={index} className="relative">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full ${collapsed ? "justify-center" : "justify-start"} gap-3 h-12 text-left hover:bg-[#00c6a9] hover:text-white transition-colors`}
                title={collapsed ? item.label : undefined}
                onClick={() => shouldNavigate && navigate(item.path!)}
                disabled={!shouldNavigate && !item.badge}
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto bg-[#00c6a9] text-white px-2 py-1 text-xs rounded-full">{item.badge}</span>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Pro Upgrade */}
      <div className="p-4 border-t border-border">
        {!collapsed && (
          <div
            className="rounded-lg p-4 text-white bg-gradient-to-br from-[#00c6a9] via-[#00d4b8] to-[#03816e]"
          >
            <h3 className="font-semibold mb-1">Use o MyCreators Pro</h3>
            <p className="text-sm text-white/80 mb-3">
              Explore as novidades e acelerar seu crescimento
            </p>
            <Button 
              variant="default" 
              className="w-full bg-white text-[#00c6a9] hover:bg-white/90 font-semibold"
            >
              Seja PRO ⚡
            </Button>
          </div>
        )}
        
        <div className={`mt-4 flex items-center ${collapsed ? "justify-end" : "justify-between"} text-sm text-muted-foreground`}>
          {!collapsed && <span>Minimizar</span>}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-transparent"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expandir" : "Minimizar"}
          >
            <img
              src={closeSidebarIcon}
              alt={collapsed ? "Expandir" : "Minimizar"}
              className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;