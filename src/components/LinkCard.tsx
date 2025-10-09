import { Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface LinkCardProps {
  title: string;
  url: string;
  icon?: string;
  image?: string;
  bgColor?: string;
  hideUrl?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const LinkCard = ({ title, url, icon, image, bgColor, hideUrl, onEdit, onDelete }: LinkCardProps) => {
  return (
    <Card className="p-4 bg-white shadow-card border-0 transition-smooth hover:shadow-elegant rounded-3xl">
      <div className="flex items-center gap-3">
        {/* Icon/Image */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${!bgColor && !image ? "bg-muted" : ""}`}
          style={bgColor ? { backgroundColor: bgColor } : undefined}
        >
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : icon ? (
            <span className="text-lg">{icon}</span>
          ) : (
            <div className="w-6 h-6 bg-primary rounded-full"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{title}</h3>
          {!hideUrl && (
            <p className="text-sm text-muted-foreground truncate">{url}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onEdit}
            className="h-8 w-8 hover:bg-muted rounded-full"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 hover:bg-muted rounded-full"
                aria-label="Mais ações"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete?.()}>
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};

export default LinkCard;