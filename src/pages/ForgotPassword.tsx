import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";
import logo from "/images/logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Erro",
        description: "Por favor, insira seu email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await resetPassword(email);

    setLoading(false);

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEmailSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha",
      });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-[hsl(171,100%,45%)] via-[hsl(171,100%,39%)] to-[hsl(171,100%,30%)] flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[hsl(171,100%,50%)]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden relative z-10">
        <div className="p-8 sm:p-10">
          {/* Back Button */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para login
          </Link>

          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img src={logo} alt="MyCreator" className="h-16 w-auto" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Esqueceu a senha?
            </h1>
            <p className="text-muted-foreground mt-2">
              {emailSent
                ? "Email enviado com sucesso!"
                : "Sem problemas, vamos te ajudar"}
            </p>
          </div>

          {emailSent ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-1">
                      Verifique seu email
                    </h3>
                    <p className="text-sm text-green-700">
                      Enviamos um link para <strong>{email}</strong> para você
                      redefinir sua senha. O link expira em 1 hora.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Não recebeu o email?
                </p>
                <Button
                  onClick={() => setEmailSent(false)}
                  variant="outline"
                  className="w-full h-12 rounded-xl"
                >
                  Tentar novamente
                </Button>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-[#00c6a9] hover:text-[#03816e] transition-colors"
                >
                  Voltar para o login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-gray-200 focus:border-[#00c6a9] focus:ring-[#00c6a9]"
                  disabled={loading}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Digite o email associado à sua conta
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[hsl(171,100%,35%)] to-[hsl(171,100%,45%)] hover:from-[hsl(171,100%,30%)] hover:to-[hsl(171,100%,40%)] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Lembrou da senha?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-[#00c6a9] hover:text-[#03816e] transition-colors"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Bottom Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-[hsl(171,100%,35%)] to-[hsl(171,100%,45%)]" />
      </Card>
    </div>
    </PageTransition>
  );
};

export default ForgotPassword;
