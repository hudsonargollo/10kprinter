import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Globe2, DollarSign, Target, CheckCircle2, ShieldCheck, Zap, ArrowRight, UserCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

export function StrategicBriefingSection() {
  const { lang } = useLanguage();
  const [activePillar, setActivePillar] = useState(0);

  const copy = {
    en: {
      badge: "STRATEGIC BRIEFING & MONETIZATION ARCHITECTURE",
      addressedTo: "Prepared for Carla Yorgely & Global Partners",
      founderTag: "System Architecture by Hudson Argollo",
      headline: "How We Massively Prospect & Monetize Web Development Worldwide",
      sub: "A borderless machine built to solve the hardest problem in tech services: generating qualified client demand and closing profitable web/dev deals at scale.",
      pillars: [
        {
          id: "discovery",
          tag: "PILLAR 01",
          title: "Massive Geographic Discovery",
          icon: Globe2,
          summary: "Zero cold call directories. Direct spatial scraping of high-ticket local businesses in any global city.",
          details: [
            "Point to any city globally (Santa Cruz, Miami, São Paulo, London, Madrid, Tokyo).",
            "Auto-filters chains & aggregates real independent businesses with active websites.",
            "Captures verified phone numbers, Google ratings, owner contacts, and live URLs.",
            "Scales to hundreds of qualified leads per run with zero manual database building.",
          ],
          metric: "50-200 Fresh Leads / Minute",
        },
        {
          id: "audit",
          tag: "PILLAR 02",
          title: "Blunt DOM Diagnostic Auditing",
          icon: Target,
          summary: "Simulates an elite $500/hr conversion consultant in 15 seconds. No AI hallucinations.",
          details: [
            "Headless browser loads real mobile DOM tree and computes precise speed & UX metrics.",
            "Pinpoints exact revenue leaks: missing WhatsApp hooks, slow load times, poor mobile layout.",
            "Categorizes findings into good / bad / fix matrices that business owners instantly understand.",
            "Generates undeniable technical authority before you ever send a pitch.",
          ],
          metric: "100% Real DOM Grounding",
        },
        {
          id: "pricing",
          tag: "PILLAR 03",
          title: "Dynamic Tier Stacking ($100 → $3,000+)",
          icon: DollarSign,
          summary: "Eliminates price hesitation with low-friction entry offers stacking into full redesign retainers.",
          details: [
            "Entry Hook ($100-$200): Fix immediate mobile booking friction or speed bottlenecks.",
            "Full Redesign ($300-$1,200): Modern Next.js / Tailwind conversion machine.",
            "Consult & Retainer (+$100-$500/mo): Ongoing optimization, SEO, and lead automation.",
            "Auto-extracts Tailwind brand tokens directly from their existing logo for instant previews.",
          ],
          metric: "80%+ Higher Closing Rate",
        },
        {
          id: "monetization",
          tag: "PILLAR 04",
          title: "Global Scalability & Rapid Monetization",
          icon: Zap,
          summary: "Operate anywhere on Earth with native multilingual support (ES, PT, EN) and 1-click delivery.",
          details: [
            "Native language detection: Spanish for Bolivia/LatAm, Portuguese for Brazil, English globally.",
            "1-Click WhatsApp & Email outreach with personalized proposal links.",
            "Built on Cloudflare Workers, D1 & R2 for near-zero server infrastructure costs.",
            "Enables a solo operator or small team to generate agency-scale revenue.",
          ],
          metric: "Global Reach · Zero Physical Limits",
        },
      ],
      missionTitle: "The Core Philosophy from Hudson Argollo:",
      missionQuote:
        "“Traditional web agencies fail because cold outreach is generic, manual, and unpriced. MoneyMachine inverts the model: we arrive with the problem already diagnosed, the fix already architected, and the price already transparent. This turns cold prospects into enthusiastic clients in any market on earth.”",
      cta: "Explore Live Dashboard",
    },
    es: {
      badge: "BRIEFING ESTRATÉGICO Y ARQUITECTURA DE MONETIZACIÓN",
      addressedTo: "Dirigido a Carla Yorgely y Colaboradores Globales",
      founderTag: "Arquitectura del Sistema por Hudson Argollo",
      headline: "Cómo Prospeccionamos Masivamente y Monetizamos Desarrollo Web en Todo el Mundo",
      sub: "Una máquina sin fronteras construida para resolver el mayor desafío de las empresas de tecnología: generar demanda calificada de clientes y cerrar proyectos web altamente rentables a escala.",
      pillars: [
        {
          id: "discovery",
          tag: "PILAR 01",
          title: "Caza Geográfica Masiva",
          icon: Globe2,
          summary: "Sin directorios obsoletos. Búsqueda espacial directa de negocios locales de alto valor en cualquier ciudad del mundo.",
          details: [
            "Apúntala a cualquier ciudad del mundo (Santa Cruz, Miami, São Paulo, Madrid, etc.).",
            "Filtra cadenas masivas y localiza negocios independientes reales con sitios activos.",
            "Captura teléfonos verificados, reseñas de Google, contactos y URLs en vivo.",
            "Escala a cientos de leads calificados por ciclo sin recopilación manual de datos.",
          ],
          metric: "50-200 Leads Frescos / Minuto",
        },
        {
          id: "audit",
          tag: "PILAR 02",
          title: "Auditoría DOM Técnica y Contundente",
          icon: Target,
          summary: "Simula un consultor de conversión de $500/hora en 15 segundos. Cero alucinaciones de IA.",
          details: [
            "Navegador headless analiza el árbol DOM móvil real y calcula métricas exactas de velocidad y UX.",
            "Identifica fugas críticas de ingresos: falta de botón de WhatsApp visible, lentitud de carga, mal diseño móvil.",
            "Estructura hallazgos en matrices de bueno / malo / solución que cualquier dueño de negocio entiende al instante.",
            "Genera autoridad técnica indiscutible antes del primer mensaje.",
          ],
          metric: "100% Basado en Datos Reales",
        },
        {
          id: "pricing",
          tag: "PILAR 03",
          title: "Monetización Escalonada ($100 → $3,000+ USD)",
          icon: DollarSign,
          summary: "Elimina la resistencia al precio con ofertas de entrada accesibles que escalan a rediseños completos y mensualidades.",
          details: [
            "Gancho Inicial ($100-$200 USD): Corrección inmediata de reservas móviles o velocidad.",
            "Rediseño Completo ($300-$1,200 USD): Nueva web moderna en Next.js optimizada para ventas.",
            "Consultoría y Retenedor (+$100-$500/mes): Mantenimiento continuo, SEO y automatizaciones.",
            "Extrae paletas de color Tailwind de su propio logo para entregar propuestas visuales irresistibles.",
          ],
          metric: "80%+ Mayor Tasa de Cierre",
        },
        {
          id: "monetization",
          tag: "PILAR 04",
          title: "Escalabilidad Global y Monetización Ágil",
          icon: Zap,
          summary: "Opera desde y hacia cualquier parte del mundo con soporte multilingüe nativo (ES, PT, EN) y entrega en 1 clic.",
          details: [
            "Detección de idioma automática: Español para Bolivia y Latinoamérica, Portugués para Brasil, Inglés mundial.",
            "Contacto en 1 clic por WhatsApp y correo con enlaces de propuesta personalizados.",
            "Construido sobre Cloudflare Workers, D1 y R2 con costos de infraestructura casi nulos.",
            "Permite a un operador individual o equipo pequeño generar ingresos a nivel de agencia grande.",
          ],
          metric: "Alcance Global · Sin Límites Físicos",
        },
      ],
      missionTitle: "La Filosofía Central de Hudson Argollo:",
      missionQuote:
        "«Las agencias tradicionales fracasan porque su prospección es genérica, manual y sin precios claros. MoneyMachine invierte el modelo: llegamos con el problema ya diagnosticado, la solución ya diseñada y el precio completamente transparente. Esto convierte prospectos fríos en clientes reales en cualquier mercado del mundo.»",
      cta: "Explorar Panel de Control",
    },
    pt: {
      badge: "BRIEFING ESTRATÉGICO E ARQUITETURA DE MONETIZAÇÃO",
      addressedTo: "Dedicado a Carla Yorgely e Parceiros Globais",
      founderTag: "Arquitetura do Sistema por Hudson Argollo",
      headline: "Como Prospecionamos Massivamente e Monetizamos Desenvolvimento Web no Mundo Inteiro",
      sub: "Uma máquina sem fronteiras criada para resolver o maior desafio de agências e devs: gerar demanda qualificada e fechar contratos web altamente lucrativos em escala.",
      pillars: [
        {
          id: "discovery",
          tag: "PILAR 01",
          title: "Caça Geográfica Massiva",
          icon: Globe2,
          summary: "Sem listas frias obsoletas. Varredura espacial direta de empresas locais em qualquer cidade do planeta.",
          details: [
            "Aponte para qualquer cidade global (Santa Cruz, Miami, São Paulo, Lisboa, etc.).",
            "Filtra redes genéricas e encontra empresas locais reais com sites ativos.",
            "Captura telefones verificados, notas do Google e URLs reais.",
            "Escala para centenas de leads qualificados por execução sem trabalho manual.",
          ],
          metric: "50-200 Leads / Minuto",
        },
        {
          id: "audit",
          tag: "PILAR 02",
          title: "Auditoria DOM Técnica e Direta",
          icon: Target,
          summary: "Simula um consultor de conversão de ponta em 15 segundos. Sem alucinações de IA.",
          details: [
            "Browser headless analisa o DOM real mobile e calcula velocidade e UX.",
            "Identifica vazamentos críticos de receita: falta de WhatsApp no topo, lentidão, layout quebrado.",
            "Estrutura achados em bom / ruim / correção que qualquer empresário entende.",
            "Gera autoridade técnica imediata antes de enviar a proposta.",
          ],
          metric: "100% Baseado em Dados Reais",
        },
        {
          id: "pricing",
          tag: "PILAR 03",
          title: "Precificação Escalonada ($100 → $3.000+ USD)",
          icon: DollarSign,
          summary: "Elimina a trava de preço com ofertas de entrada acessíveis que empilham para projetos completos.",
          details: [
            "Gancho Inicial ($100-$200 USD): Correção rápida de conversão ou velocidade.",
            "Redesign Completo ($300-$1.200 USD): Nova landing page Next.js de alta conversão.",
            "Consultoria e Retentor (+$100-$500/mês): Otimização contínua e automações.",
            "Extrai paleta Tailwind da logo existente para propostas visualmente impecáveis.",
          ],
          metric: "80%+ Mais Conversão em Vendas",
        },
        {
          id: "monetization",
          tag: "PILAR 04",
          title: "Escalabilidade Global e Monetização Rápida",
          icon: Zap,
          summary: "Opere de qualquer lugar do mundo com suporte nativo multilíngue (ES, PT, EN) e envio em 1 clique.",
          details: [
            "Detecção de idioma nativa: Espanhol para Bolívia/América Latina, Português para Brasil, Inglês global.",
            "Disparo em 1 clique no WhatsApp e e-mail com link de proposta customizado.",
            "Infraestrutura Cloudflare Workers, D1 e R2 com custo de servidor próximo a zero.",
            "Permite a um operador solo ou equipe enxuta faturar como agência de ponta.",
          ],
          metric: "Alcance Global · Sem Barreiras",
        },
      ],
      missionTitle: "A Filosofia de Hudson Argollo:",
      missionQuote:
        "«Agências tradicionais sofrem porque a prospecção é fria, genérica e sem preço claro. A MoneyMachine inverte o jogo: já chegamos com o diagnóstico feito, o escopo desenhado e o preço transparente. Isso transforma leads frios em clientes pagantes em qualquer lugar do mundo.»",
      cta: "Acessar o Painel",
    },
  };

  const t = copy[lang] || copy.en;
  const p = t.pillars[activePillar];
  const IconComponent = p.icon;

  return (
    <section id="strategic-briefing" className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-[#090b10] via-black to-[#090b10] border-y border-white/10">
      {/* Background Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#e8ff5c]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-6xl relative z-10 space-y-12">
        {/* Header Block */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8ff5c]/15 border border-[#e8ff5c]/35 text-[#e8ff5c] text-xs font-mono font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              {t.badge}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-mono">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              {t.addressedTo}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-white leading-tight">
            {t.headline}
          </h2>

          <p className="text-base sm:text-lg text-white/70 leading-relaxed">
            {t.sub}
          </p>

          <div className="pt-1 text-xs font-mono text-[#e8ff5c] font-semibold">
            {t.founderTag}
          </div>
        </div>

        {/* 4 Pillars Interactive Matrix */}
        <div className="grid lg:grid-cols-12 gap-6 items-start pt-4">
          {/* Pillar Selector Tabs (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            {t.pillars.map((pillar, idx) => {
              const PillarIcon = pillar.icon;
              const isSelected = activePillar === idx;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillar(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                    isSelected
                      ? "bg-white/[0.08] border-[#e8ff5c] shadow-lg shadow-[#e8ff5c]/5"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#e8ff5c] text-black"
                          : "bg-white/5 text-white/60 group-hover:text-white"
                      }`}
                    >
                      <PillarIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono font-bold tracking-wider text-white/40 uppercase">
                        {pillar.tag}
                      </div>
                      <div className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-white/80"}`}>
                        {pillar.title}
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? "text-[#e8ff5c] translate-x-1" : "text-white/20 group-hover:text-white/50"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Active Pillar Showcase Card (Right 7 Cols) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
              >
                {/* Top Meta */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#e8ff5c]/15 text-[#e8ff5c]">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-[#e8ff5c] font-bold">{p.tag}</span>
                      <h3 className="text-lg font-bold text-white font-heading">{p.title}</h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                    {p.metric}
                  </span>
                </div>

                <p className="text-white/80 text-sm sm:text-base leading-relaxed font-medium">
                  {p.summary}
                </p>

                {/* Bullets */}
                <div className="space-y-3 pt-2">
                  {p.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-3 text-xs sm:text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Live Architecture Footnote */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/40">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Cloudflare Edge Pipeline
                  </span>
                  <span className="text-[#e8ff5c]">Ready for Global Deployment</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Founder's Mission Statement Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-[#e8ff5c]/30 bg-gradient-to-r from-[#e8ff5c]/10 via-black to-[#e8ff5c]/5 p-6 sm:p-8 space-y-4 shadow-xl"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-[#e8ff5c] font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>{t.missionTitle}</span>
          </div>

          <p className="text-base sm:text-lg text-white/90 italic font-serif leading-relaxed">
            {t.missionQuote}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="text-xs font-mono text-white/60">
              <strong className="text-white">Hudson Argollo</strong> · Founder & Architect · ClubeMkt Ecosystem
            </div>
            <Button
              asChild
              className="bg-[#e8ff5c] hover:bg-[#d8ef4c] text-black font-bold font-mono text-xs rounded-full px-5 h-10 shadow-md cursor-pointer"
            >
              <a href="/app" className="flex items-center gap-2">
                <span>{t.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
