import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UsernameService } from "@/services/supabaseService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Check, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";
import logo from "/images/logo.png";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameMessage, setUsernameMessage] = useState("");
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debounce para verificação de username
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      setUsernameMessage("");
      return;
    }

    // Validar formato localmente primeiro
    const formatValidation = UsernameService.validateFormat(username);
    if (!formatValidation.valid) {
      setUsernameAvailable(false);
      setUsernameMessage(formatValidation.message || "");
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      const result = await UsernameService.checkAvailability(username);
      setUsernameAvailable(result.available);
      setUsernameMessage(result.message);
      setCheckingUsername(false);
    }, 500); // 500ms de debounce

    return () => clearTimeout(timer);
  }, [username]);

  // Password strength validation
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isPasswordStrong = Object.values(passwordRequirements).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    // Validar username
    if (username.length < 3) {
      toast({
        title: "Erro",
        description: "O nome de usuário deve ter pelo menos 3 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (!usernameAvailable) {
      toast({
        title: "Username indisponível",
        description: usernameMessage || "Este username já está em uso",
        variant: "destructive",
      });
      return;
    }

    if (!isPasswordStrong) {
      toast({
        title: "Senha fraca",
        description: "Por favor, atenda todos os requisitos de senha",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, username);

    if (error) {
      toast({
        title: "Erro ao criar conta",
        description: error.message === "User already registered"
          ? "Este email já está cadastrado"
          : error.message,
        variant: "destructive",
      });
      setLoading(false);
    } else {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        toast({
          title: "Conta criada, mas houve um problema ao logar",
          description: signInError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Você já está logado.",
      });
      navigate("/");
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-[hsl(171,100%,45%)] via-[hsl(171,100%,39%)] to-[hsl(171,100%,30%)] flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 left-20 w-80 h-80 bg-[hsl(171,100%,50%)]/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[hsl(171,100%,35%)]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden relative z-10">
        <div className="p-8 sm:p-10">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img src={logo} alt="MyCreator" className="h-16 w-auto" />
            </div>
            <p className="text-muted-foreground mt-2">
              Junte-se ao MyCreator gratuitamente
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Nome de usuário
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="seuusuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  className="h-12 rounded-xl border-gray-200 focus:border-[#00c6a9] focus:ring-[#00c6a9] pr-10"
                  disabled={loading}
                />
                {username.length >= 3 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : usernameAvailable === true ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : usernameAvailable === false ? (
                      <X className="w-5 h-5 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {username.length > 0 && username.length < 3 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Mínimo 3 caracteres</span>
                </div>
              )}
              {username.length >= 3 && usernameMessage && (
                <div className={`flex items-center gap-1.5 text-xs ${
                  usernameAvailable ? 'text-green-600' : 'text-red-500'
                }`}>
                  {usernameAvailable ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                  <span>{usernameMessage}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Apenas letras minúsculas e números.
              </p>
            </div>

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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-gray-200 focus:border-[#00c6a9] focus:ring-[#00c6a9] pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {password.length > 0 && (
                <div className="space-y-1 mt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordRequirements.minLength
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    >
                      {passwordRequirements.minLength && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span
                      className={
                        passwordRequirements.minLength
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      Mínimo 8 caracteres
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordRequirements.hasUpperCase
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    >
                      {passwordRequirements.hasUpperCase && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span
                      className={
                        passwordRequirements.hasUpperCase
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      Uma letra maiúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordRequirements.hasLowerCase
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    >
                      {passwordRequirements.hasLowerCase && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span
                      className={
                        passwordRequirements.hasLowerCase
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      Uma letra minúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordRequirements.hasNumber
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    >
                      {passwordRequirements.hasNumber && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span
                      className={
                        passwordRequirements.hasNumber
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      Um número
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl border-gray-200 focus:border-[#00c6a9] focus:ring-[#00c6a9] pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-xs text-red-500">As senhas não coincidem</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[hsl(171,100%,35%)] to-[hsl(171,100%,45%)] hover:from-[hsl(171,100%,30%)] hover:to-[hsl(171,100%,40%)] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Criando conta...
                </>
              ) : (
                "Criar conta grátis"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Ao criar uma conta, você concorda com nossos{" "}
              <Link to="/terms" className="text-[#00c6a9] hover:underline">
                Termos de Serviço
              </Link>{" "}
              e{" "}
              <Link to="/privacy" className="text-[#00c6a9] hover:underline">
                Política de Privacidade
              </Link>
            </p>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-muted-foreground">
                ou
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#00c6a9] hover:text-[#03816e] transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-[hsl(171,100%,35%)] to-[hsl(171,100%,45%)]" />
      </Card>
    </div>
    </PageTransition>
  );
};

export default Signup;
