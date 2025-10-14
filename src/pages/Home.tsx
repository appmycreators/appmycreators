import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Globe, Zap, BarChart3, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import Topbar from "@/components/ui/topbar";

const marketingTips = [
  {
    id: 1,
    title: "Otimize seu Bio Link",
    description: "Use títulos chamativos e CTAs claras para aumentar conversões em até 40%",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 2,
    title: "Domínio Personalizado",
    description: "Marque sua presença com um domínio próprio e aumente sua credibilidade",
    icon: Globe,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    title: "Analytics em Tempo Real",
    description: "Monitore cliques e conversões para otimizar sua estratégia",
    icon: BarChart3,
    color: "from-orange-500 to-red-500",
  },
  {
    id: 4,
    title: "Customize Seu Visual",
    description: "Crie uma experiência única com cores, fontes e layouts personalizados",
    icon: Zap,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 5,
    title: "Capture Leads Qualificados",
    description: "Formulários inteligentes que transformam visitantes em contatos valiosos",
    icon: Users,
    color: "from-yellow-500 to-orange-500",
  },
];

const Home = () => {
  const isMobile = useIsMobile();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % marketingTips.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + marketingTips.length) % marketingTips.length);
  };

  const currentTip = marketingTips[currentSlide];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {!isMobile && <Sidebar />}
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
        {isMobile && <Topbar />}
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00c6a9]/10 rounded-full border border-[#00c6a9]/30">
                <Star className="w-4 h-4 text-[#00c6a9] fill-[#00c6a9]" />
                <span className="text-sm font-medium text-[#00c6a9]">Bem-vindo ao MyCreators</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-slate-900">
                Transforme seu
                <span className="bg-gradient-to-r from-[#00c6a9] to-[#03816e] bg-clip-text text-transparent"> Bio Link </span>
                em uma ferramenta poderosa
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
                Centralize todos os seus links, capture leads e acompanhe resultados em tempo real
              </p>

             
            </motion.div>

            

            {/* Marketing Tips Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-4"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">Dicas de Marketing</h2>
                <p className="text-slate-600">Aprenda estratégias comprovadas para crescer sua audiência</p>
              </div>

              <div className="relative">
                <Card className="p-8 sm:p-12 border-0 shadow-2xl bg-white overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${currentTip.color} opacity-5`} />
                  
                  <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    <motion.div
                      key={currentSlide}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className={`p-4 rounded-2xl bg-gradient-to-br ${currentTip.color}`}
                    >
                      <currentTip.icon className="w-12 h-12 text-white" />
                    </motion.div>

                    <motion.div
                      key={`content-${currentSlide}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        {currentTip.title}
                      </h3>
                      <p className="text-lg text-slate-600 max-w-2xl">
                        {currentTip.description}
                      </p>
                    </motion.div>

                    <div className="flex items-center gap-2">
                      {marketingTips.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentSlide
                              ? "bg-[#00c6a9] w-8"
                              : "bg-slate-300 hover:bg-slate-400"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-slate-700" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-slate-700" />
                  </button>
                </Card>
              </div>
            </motion.div>

            {/* Custom Domain Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="relative overflow-hidden border-0 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00c6a9] via-[#00d4b5] to-[#03816e]" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
                
                <div className="relative z-10 p-8 sm:p-12 lg:p-16 text-center text-white space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full border border-white/30">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">Plano PRO</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                    Eleve Sua Marca com um
                    <br />
                    <span className="text-white drop-shadow-lg">Domínio Personalizado</span>
                  </h2>

                  <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto">
                    Impressione seu público com links profissionais como <strong>seudominio.com</strong> ao invés de <span className="line-through opacity-60">mycreators.me</span>
                  </p>

                  <ul className="inline-flex flex-col items-start gap-3 text-left">
                    {[
                      "✨ Aumenta credibilidade em até 73%",
                      "🚀 Melhora SEO e ranqueamento",
                      "🎯 Marca memorável e profissional",
                      "🔒 SSL grátis incluso",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-lg">
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-4 justify-center pt-4">
                    <Button 
                      size="lg" 
                      className="bg-white text-[#00c6a9] hover:bg-white/90 font-semibold px-8 shadow-xl"
                    >
                      Ativar Domínio Personalizado
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white/30 text-[#00c6a9] hover:bg-white/10 font-semibold backdrop-blur"
                    >
                      Saiba Mais
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: Sparkles,
                  title: "Design Personalizado",
                  description: "Customize cores, fontes e layouts",
                },
                {
                  icon: BarChart3,
                  title: "Analytics Avançado",
                  description: "Dados em tempo real sobre cliques",
                },
                {
                  icon: Users,
                  title: "Captura de Leads",
                  description: "Formulários integrados e CRM",
                },
              ].map((feature, index) => (
                <Card key={index} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all bg-white/80 backdrop-blur">
                  <div className="inline-flex p-3 rounded-xl bg-[#00c6a9]/10 mb-4">
                    <feature.icon className="w-6 h-6 text-[#00c6a9]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </Card>
              ))}
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
