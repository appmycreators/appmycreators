import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/ui/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState } from "react";

const EditHeader = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState<string>("Meu Sandwiche");
  const [bio, setBio] = useState<string>("");

  const onPickImage = () => fileInputRef.current?.click();
  const onRemoveImage = () => setAvatarUrl(null);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Topbar />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-3xl p-6 shadow-card border border-border/60">
              {/* Foto de perfil */}
              <div className="mb-6">
                <div className="text-sm font-medium text-foreground mb-3">Foto de perfil</div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Button onClick={onPickImage} className="w-full h-10 rounded-full bg-foreground text-background hover:opacity-90">
                      Pick an image
                    </Button>
                    <Button variant="outline" onClick={onRemoveImage} className="w-full h-10 rounded-full">
                      Remove
                    </Button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                  </div>
                </div>
              </div>

              {/* Nome do perfil */}
              <div className="mb-6">
                <div className="text-sm font-medium text-foreground mb-2">Nome do perfil</div>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl" />
              </div>

              {/* Bio */}
              <div className="mb-6">
                <div className="text-sm font-medium text-foreground mb-2">Bio</div>
                <Textarea placeholder="Adicionar descrição" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[120px] rounded-xl" />
              </div>

              {/* Vídeo ou imagem de topo */}
              <div>
                <div className="text-sm font-medium text-foreground mb-2">Vídeo ou imagem de topo</div>
                <div className="flex items-center justify-between h-14 px-4 border rounded-xl bg-white">
                  <div className="text-sm text-muted-foreground">PNG, JPG, MP4, MOV ou MPG</div>
                  <Button variant="secondary" className="rounded-full">Upload</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditHeader;
