import { useState } from "react";
import { setLeadNotes, transitionLeadStage } from "../../api";
import { waLink } from "../../lib/waLink";
import { TIER_CLASS } from "@/lib/tier";
import type { LeadDetail as LeadDetailData, Prd } from "../../types";
import { CONSULT_ADDON_USD } from "../../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  MessageSquare,
  Phone,
  UserCheck,
  Calendar,
  Layers,
  Copy,
  Check,
  ExternalLink,
  DollarSign,
  Clock,
  Send,
  Sparkles,
} from "lucide-react";

interface ScriptItem {
  id: string;
  title: string;
  channel: string;
  script: string;
  tip?: string;
}

export function SalesTab({
  lead,
  audits,
  prds,
  onRefresh,
}: {
  lead: LeadDetailData["lead"];
  audits: LeadDetailData["audits"];
  prds: Prd[];
  onRefresh: () => void;
}) {
  const { t, lang } = useLanguage();
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);
  const [activeScriptTab, setActiveScriptTab] = useState<string>("whatsapp");
  const [retainerTier, setRetainerTier] = useState<number>(197);

  const [notesDraft, setNotesDraft] = useState(lead.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [amountDraft, setAmountDraft] = useState(
    String(prds.reduce((sum, p) => sum + (p.price_usd ?? 0), 0) + CONSULT_ADDON_USD),
  );
  const [lostReasonDraft, setLostReasonDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const qualifyingCount = audits.filter((a) => a.qualifies).length;
  const businessName = lead.business_name || lead.url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const oneTimeTotal = prds.reduce((sum, p) => sum + (p.price_usd ?? 0), 0) + CONSULT_ADDON_USD;
  const annualLtv = oneTimeTotal + retainerTier * 12;

  // Extract key findings for dynamic script generation
  const allBadFindings: string[] = [];
  const allFixFindings: string[] = [];
  audits.forEach((a) => {
    try {
      const parsed = JSON.parse(a.findings_json);
      if (Array.isArray(parsed.bad)) allBadFindings.push(...parsed.bad.map(String));
      if (Array.isArray(parsed.fix)) allFixFindings.push(...parsed.fix.map(String));
    } catch {
      // ignore
    }
  });

  const mainFriction = allBadFindings[0] || (lang === "pt" ? "falta de captura direta no WhatsApp e carregamento lento" : lang === "es" ? "falta de captura directa a WhatsApp y velocidad lenta" : "no automated lead capture or instant WhatsApp funnel");
  const mainFix = allFixFindings[0] || (lang === "pt" ? "motor de conversão direta em 1-clique e carregamento instantâneo na Cloudflare" : lang === "es" ? "motor de conversión directa en 1-clic y velocidad ultra-rápida en Cloudflare" : "instant 1-click conversion engine on Cloudflare Edge");

  const showcaseUrl = lead.showcase_url || `${window.location.origin}/api/leads/${lead.id}/proposals/website-redesign`;

  // Script Generators for each channel based on language
  const scripts: Record<string, ScriptItem[]> = {
    whatsapp: [
      {
        id: "wa-hook",
        title: lang === "pt" ? "Abertura Direta (WhatsApp)" : lang === "es" ? "Apertura Directa (WhatsApp)" : "Direct Icebreaker (WhatsApp)",
        channel: "WhatsApp",
        script: lang === "pt"
          ? `Olá ${businessName}! Tudo bem?\n\nEstava analisando o site de vocês (${lead.url}) e notei uma oportunidade imediata de dobrar os contatos que chegam: hoje o site apresenta ${mainFriction}.\n\nDesenvolvemos uma proposta visual interativa mostrando exatamente como resolver isso com ${mainFix}.\n\nVocê pode dar uma olhada aqui (leva 45 segundos): ${showcaseUrl}\n\nO que achou da ideia?`
          : lang === "es"
          ? `¡Hola ${businessName}! ¿Cómo estás?\n\nEstaba analizando su sitio web (${lead.url}) y noté una oportunidad inmediata para duplicar los clientes potenciales: hoy el sitio presenta ${mainFriction}.\n\nDiseñamos una propuesta visual interactiva mostrando exactamente cómo solucionarlo con ${mainFix}.\n\nPuedes revisarla aquí (toma 45 segundos): ${showcaseUrl}\n\n¿Qué te parece la propuesta?`
          : `Hi ${businessName}! Hope you're having a great week.\n\nI was reviewing your website (${lead.url}) and noticed an immediate opportunity to increase customer inquiries: currently ${mainFriction}.\n\nWe engineered a confidential modernization showcase showing exactly how we fix this with ${mainFix}.\n\nYou can preview the interactive live proposal here (takes 45s): ${showcaseUrl}\n\nWhat do you think?`,
        tip: lang === "pt" ? "Envie no horário comercial com o link do showcase ativo." : lang === "es" ? "Enviar en horario laboral con el link del showcase activo." : "Send during business hours with the active showcase link.",
      },
      {
        id: "wa-followup",
        title: lang === "pt" ? "Follow-Up 48h (WhatsApp)" : lang === "es" ? "Seguimiento 48h (WhatsApp)" : "48h Follow-up (WhatsApp)",
        channel: "WhatsApp",
        script: lang === "pt"
          ? `Olá ${businessName}, conseguiu ver a demonstração que te enviei (${showcaseUrl})?\n\nTemos disponibilidade para implementar todo esse motor em apenas 7 dias. Consegue falar 5 minutinhos hoje à tarde?`
          : lang === "es"
          ? `Hola ${businessName}, ¿pudiste ver la demostración interactiva que te envié (${showcaseUrl})?\n\nPodemos dejar implementado todo este sistema en solo 7 días. ¿Tienes 5 minutos hoy en la tarde?`
          : `Hey ${businessName}, did you get a chance to check out the live demo (${showcaseUrl})?\n\nWe have a 7-day implementation window opening next week. Do you have 5 minutes for a quick chat today?`,
      },
    ],
    call: [
      {
        id: "phone-script",
        title: lang === "pt" ? "Script de Ligação Fria (30 Segundos)" : lang === "es" ? "Guión de Llamada Fría (30 Segundos)" : "Cold Call Script (30 Seconds)",
        channel: "Telefone",
        script: lang === "pt"
          ? `Operador: "Olá, falo com o responsável pelo marketing ou proprietário da ${businessName}?\n\nMeu nome é Hudson da ClubeMkt. Estou ligando bem rápido porque preparei uma demonstração técnica para o site de vocês (${lead.url}).\n\nIdentifiquei que vocês estão perdendo potenciais clientes por causa de ${mainFriction}. Já estruturei a solução visual completa pronta para subir em 7 dias.\n\nPosso te enviar o link no WhatsApp agora para você dar uma olhada de 1 minuto?"`
          : lang === "es"
          ? `Operador: "Hola, ¿me comunico con el encargado de marketing o dueño de ${businessName}?\n\nMi nombre es Hudson de ClubeMkt. Te llamo brevemente porque preparé una demostración técnica para su sitio web (${lead.url}).\n\nDetecté que están perdiendo consultas de clientes debido a ${mainFriction}. Ya diseñé la solución visual completa lista para implementar en 7 días.\n\n¿Te puedo enviar el enlace por WhatsApp ahora mismo para que lo veas en 1 minuto?"`
          : `Caller: "Hi, am I speaking with the business owner or director at ${businessName}?\n\nMy name is Hudson with ClubeMkt. The reason for my call is brief: I just finished a conversion audit on your website (${lead.url}).\n\nWe pinpointed that you are losing inbound leads due to ${mainFriction}. I've already prepared a working interactive demo that fixes this in 7 days.\n\nCan I text you the private preview link to take a 45-second look?"`,
        tip: lang === "pt" ? "O objetivo da ligação é apenas conseguir permissão para enviar o WhatsApp com o showcase." : lang === "es" ? "El objetivo es solo conseguir permiso para enviar el enlace por WhatsApp." : "The sole goal of the cold call is getting permission to text the showcase URL.",
      },
    ],
    walkin: [
      {
        id: "walkin-script",
        title: lang === "pt" ? "Abordagem Presencial (Walk-in / Visita)" : lang === "es" ? "Visita Presencial (Walk-in)" : "In-Person Walk-in Script",
        channel: "Presencial",
        script: lang === "pt"
          ? `"Olá! Tudo bem? Meu nome é Hudson, sou especialista em automação e presença digital aqui na região. Estava analisando os principais negócios locais e montei um estudo exclusivo para a ${businessName}.\n\nIdentifiquei oportunidades para aumentar o fluxo de novos clientes que hoje se perdem no site atual. Preparei um protótipo interativo no tablet/celular para mostrar como fica.\n\nO proprietário está por aí ou posso deixar com você para vermos juntos?"`
          : lang === "es"
          ? `"¡Hola! ¿Cómo están? Mi nombre es Hudson, especialista en automatización y presencia digital aquí en la ciudad. Estaba analizando negocios destacados y preparé un estudio exclusivo para ${businessName}.\n\nDetectamos oportunidades claras para aumentar las reservas y clientes que hoy se escapan del sitio web. Tengo un prototipo interactivo en mi teléfono para mostrárselo.\n\n¿Se encuentra el dueño o gerente para mostrárselo en 2 minutos?"`
          : `"Hi there! My name is Hudson, I work with local business digital growth and automation. I was reviewing premier businesses in our area and built a custom interactive showcase for ${businessName}.\n\nWe identified specific leaks where potential buyers drop off without contacting you. I have the prototype ready on my phone to show you in 2 minutes.\n\nIs the manager or owner around?"`,
      },
    ],
    meeting: [
      {
        id: "closing-meeting",
        title: lang === "pt" ? "Estrutura da Reunião de Fechamento (15 Min)" : lang === "es" ? "Estructura de Cierre en Reunión (15 Min)" : "15-Min Closing Meeting Framework",
        channel: "Reunião / Zoom",
        script: lang === "pt"
          ? `1. Diagnóstico (3 min): "Aqui está o que seu site atual faz bem, e aqui estão as 3 fricções onde os clientes desistem."\n2. Demonstração (5 min): "Abra o showcase interativo (${showcaseUrl}). Mostre o design responsivo, velocidade instantânea e funil WhatsApp."\n3. Cronograma de 7 Dias (2 min): "Dia 1-2 design tokens, Dia 3-4 automação n8n, Dia 5-6 testes, Dia 7 lançamento ao vivo na Cloudflare."\n4. Proposta de Valor (3 min): "Implementação completa por US$ ${oneTimeTotal} + suporte contínuo por US$ ${retainerTier}/mês."\n5. Pergunta de Fechamento (2 min): "Podemos reservar a vaga de desenvolvimento desta semana para vocês?"`
          : lang === "es"
          ? `1. Diagnóstico (3 min): "Esto es lo que su sitio hace bien, y aquí están los 3 puntos de fuga donde los clientes se van."\n2. Demostración (5 min): "Abre el showcase interactivo (${showcaseUrl}). Muestra la interfaz moderna, velocidad y embudo a WhatsApp."\n3. Cronograma de 7 Días (2 min): "Día 1-2 diseño, Día 3-4 automatización n8n/CRM, Día 5-6 pruebas, Día 7 lanzamiento en Cloudflare."\n4. Estructura de Inversión (3 min): "Implementación completa por US$ ${oneTimeTotal} + soporte y hosting continuo por US$ ${retainerTier}/mes."\n5. Cierre Directo (2 min): "¿Iniciamos el proyecto esta misma semana para tenerlo listo en 7 días?"`
          : `1. Diagnosis (3 min): "Here is what works today, and here are the 3 friction leaks where buyers drop off."\n2. Live Showcase (5 min): "Walk through the interactive prototype (${showcaseUrl}). Highlight instant speed and click-to-chat funnel."\n3. 7-Day Sprint (2 min): "Day 1-2 Brand tokens, Day 3-4 Workflows/n8n, Day 5-6 WhatsApp engine, Day 7 Cloudflare Edge launch."\n4. Commercial Offer (3 min): "One-time build for $${oneTimeTotal} + continuous growth/hosting for $${retainerTier}/mo."\n5. Closing Question (2 min): "Shall we lock in your build sprint for this week?"`,
      },
    ],
  };

  function copyToClipboard(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedScriptId(id);
    setTimeout(() => setCopiedScriptId(null), 2500);
  }

  async function saveNotes() {
    setSavingNotes(true);
    try {
      await setLeadNotes(lead.id, notesDraft);
      onRefresh();
    } finally {
      setSavingNotes(false);
    }
  }

  async function doTransition(status: "reviewed" | "proposal_sent" | "won" | "lost", opts?: { closedAmountUsd?: number; lostReason?: string }) {
    setBusy(true);
    try {
      await transitionLeadStage(lead.id, status, opts);
      onRefresh();
    } finally {
      setBusy(false);
    }
  }

  const defaultWaScript = scripts.whatsapp[0].script;
  const directWa = waLink(lead.phone, defaultWaScript);

  return (
    <div className="space-y-6">
      {/* Top Banner: Thermometer & Quick Actions */}
      <Card className="p-5 border-white/10 bg-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/70">
                {t.salesTab.thermometer}
              </span>
              {lead.tier && (
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold border font-mono", TIER_CLASS[lead.tier])}>
                  {t.tier[lead.tier]} · {lead.score} / 100
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {qualifyingCount}/{audits.length} {t.auditsTab.verticalsQualify} • {lead.address || "Local Business"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {directWa ? (
              <Button asChild size="sm" className="bg-[#25D366] text-black font-semibold hover:bg-[#20bd5a]">
                <a href={directWa} target="_blank" rel="noreferrer">
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  {lang === "pt" ? "Enviar Pitch no WhatsApp" : lang === "es" ? "Enviar Pitch en WhatsApp" : "Send Pitch on WhatsApp"}
                </a>
              </Button>
            ) : (
              <Button disabled variant="outline" size="sm" className="opacity-50">
                {t.salesTab.noPhone}
              </Button>
            )}

            <Button asChild variant="outline" size="sm">
              <a href={showcaseUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4 mr-1.5" />
                {t.offerTab.preview}
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {/* Human-in-the-loop sales cockpit: qualification, next action, and onboarding */}
      <Card className="p-4 border-white/10 bg-card">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.salesTab.qualification}</div>
            <div className="mt-1 text-sm font-semibold text-white">
              {lead.qualification_status === "qualified" ? t.salesTab.qualificationQualified
                : lead.qualification_status === "needs_review" ? t.salesTab.qualificationNeedsReview
                : lead.qualification_status === "disqualified" ? t.salesTab.qualificationDisqualified
                : t.salesTab.qualificationPending}
              {lead.qualification_score != null ? ` · ${lead.qualification_score}/100` : ""}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.salesTab.nextAction}</div>
            <div className="mt-1 text-sm font-semibold text-white">{lead.next_action_type || t.salesTab.noNextAction}</div>
            {lead.next_action_at && <div className="text-[11px] text-muted-foreground">{lead.next_action_at}</div>}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.salesTab.onboarding}</div>
            <div className="mt-1 text-sm font-semibold text-white">
              {lead.onboarding_status === "first_win" ? t.salesTab.onboardingFirstWin
                : lead.onboarding_status === "activated" ? t.salesTab.onboardingActivated
                : lead.onboarding_status === "in_progress" ? t.salesTab.onboardingInProgress
                : t.salesTab.onboardingNotStarted}
            </div>
          </div>
        </div>
      </Card>

      {/* Multi-Channel Pitch Scripts Section */}
      <Card className="p-5 border-white/10 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#e8ff5c]" />
            <h3 className="font-heading text-sm font-bold text-white">
              {lang === "pt" ? "Playbook de Abordagem & Scripts de Venda" : lang === "es" ? "Playbook de Venta & Guiones Personalizados" : "Multi-Channel Sales Scripts & Playbook"}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {lang === "pt" ? "Idioma: Português" : lang === "es" ? "Idioma: Español" : "Language: English"}
          </span>
        </div>

        <Tabs value={activeScriptTab} onValueChange={setActiveScriptTab}>
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl w-full justify-start">
            <TabsTrigger value="whatsapp" className="flex items-center gap-1.5 text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="call" className="flex items-center gap-1.5 text-xs">
              <Phone className="w-3.5 h-3.5" />
              <span>{lang === "pt" ? "Ligação Telefônica" : lang === "es" ? "Llamada Telefónica" : "Phone Call"}</span>
            </TabsTrigger>
            <TabsTrigger value="walkin" className="flex items-center gap-1.5 text-xs">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{lang === "pt" ? "Presencial / Visita" : lang === "es" ? "Visita Presencial" : "Walk-in"}</span>
            </TabsTrigger>
            <TabsTrigger value="meeting" className="flex items-center gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>{lang === "pt" ? "Reunião de Cierre" : lang === "es" ? "Reunión de Cierre" : "Closing Meeting"}</span>
            </TabsTrigger>
          </TabsList>

          {Object.entries(scripts).map(([channelKey, items]) => (
            <TabsContent key={channelKey} value={channelKey} className="space-y-3 mt-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#e8ff5c]" />
                      {item.title}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs font-mono"
                      onClick={() => copyToClipboard(item.id, item.script)}
                    >
                      {copiedScriptId === item.id ? (
                        <>
                          <Check className="w-3 h-3 mr-1 text-emerald-400" />
                          {lang === "pt" ? "Copiado!" : lang === "es" ? "¡Copiado!" : "Copied!"}
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          {lang === "pt" ? "Copiar Script" : lang === "es" ? "Copiar Guión" : "Copy Script"}
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="font-sans text-xs text-white/90 whitespace-pre-wrap bg-black/40 p-3 rounded-lg border border-white/5 leading-relaxed">
                    {item.script}
                  </pre>
                  {item.tip && (
                    <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      💡 <span>{item.tip}</span>
                    </p>
                  )}
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Financial & Contract Architect: One-time + MRR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Solution Investment Structure */}
        <Card className="p-5 border-white/10 bg-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-white flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#e8ff5c]" />
              <span>{lang === "pt" ? "Estrutura Comercial & Precificação" : lang === "es" ? "Estructura Comercial & Precios" : "Commercial Pricing Architecture"}</span>
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5 text-white/80">
              <span>{lang === "pt" ? "Setup & Implementação (PRDs)" : lang === "es" ? "Setup e Implementación (PRDs)" : "One-Time Setup & Build"}</span>
              <strong className="font-mono text-white">${oneTimeTotal}</strong>
            </div>

            <div className="py-2 border-b border-white/5 space-y-1.5">
              <span className="text-muted-foreground">{lang === "pt" ? "Mensalidade Recorrente (MRR)" : lang === "es" ? "Membresía Mensual (MRR)" : "Monthly Retainer (MRR)"}</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[97, 197, 297].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRetainerTier(amt)}
                    className={cn(
                      "p-1.5 rounded-lg border text-center font-mono transition-all text-xs",
                      retainerTier === amt
                        ? "border-[#e8ff5c] bg-[#e8ff5c]/10 text-[#e8ff5c] font-bold"
                        : "border-white/10 text-white/70 hover:border-white/30"
                    )}
                  >
                    ${amt}/mo
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between py-2 border-b border-white/10 text-sm font-bold">
              <span className="text-[#e8ff5c]">{lang === "pt" ? "Valor Contratual 12 Meses (LTV)" : lang === "es" ? "Valor Contrato Anual (LTV)" : "12-Month Contract LTV"}</span>
              <span className="font-mono text-[#e8ff5c]">${annualLtv}</span>
            </div>

            <div className="flex justify-between py-1 text-[11px] text-emerald-400 font-mono">
              <span>{lang === "pt" ? "Margem de Lucro Bruta Est." : lang === "es" ? "Margen Bruto Estimado" : "Estimated Gross Margin"}</span>
              <span>&gt; 94% (Cloudflare Edge Stack)</span>
            </div>
          </div>
        </Card>

        {/* 7-Day Sprint Timeline */}
        <Card className="p-5 border-white/10 bg-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#e8ff5c]" />
              <span>{lang === "pt" ? "Cronograma de Entrega (7 Dias)" : lang === "es" ? "Cronograma de Entrega (7 Días)" : "7-Day Implementation Sprint"}</span>
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="font-mono text-[#e8ff5c] font-bold shrink-0">D1-2:</span>
              <span className="text-white/80">{lang === "pt" ? "Design tokens, tipografia e arquitetura Shadcn" : lang === "es" ? "Design tokens, tipografía y arquitectura Shadcn" : "Design tokens, typography and Shadcn UI architecture"}</span>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="font-mono text-[#e8ff5c] font-bold shrink-0">D3-4:</span>
              <span className="text-white/80">{lang === "pt" ? "Construção de componentes, formulários e n8n" : lang === "es" ? "Construcción de componentes, formularios y n8n" : "Component build, smart forms & n8n workflows"}</span>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="font-mono text-[#e8ff5c] font-bold shrink-0">D5-6:</span>
              <span className="text-white/80">{lang === "pt" ? "Funil WhatsApp em 1-clique e testes de conversão" : lang === "es" ? "Embudo WhatsApp en 1-clic y pruebas de conversión" : "1-click WhatsApp funnel & conversion testing"}</span>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="font-mono text-emerald-400 font-bold shrink-0">D7:</span>
              <span className="text-white/80">{lang === "pt" ? "Virada de DNS na Cloudflare e entrega com SLA" : lang === "es" ? "Lanzamiento oficial en Cloudflare y entrega con SLA" : "Live Cloudflare Edge cutover & final SLA handover"}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Operator Notes & Stage Control */}
      <Card className="p-5 border-white/10 bg-card space-y-4">
        <h3 className="font-heading text-sm font-bold text-white flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#e8ff5c]" />
          <span>{t.salesTab.stage} &amp; {t.salesTab.notes}</span>
        </h3>

        <div className="space-y-2">
          <textarea
            className="min-h-20 w-full rounded-lg border border-input bg-background p-2.5 font-sans text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-xs"
            placeholder={lang === "pt" ? "Adicione notas da negociação, histórico de contato, objeções..." : lang === "es" ? "Agrega notas de negociación, historial, objeciones..." : "Add sales notes, call outcomes, objections..."}
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <Button onClick={saveNotes} disabled={savingNotes} size="sm">
              {savingNotes ? t.salesTab.savingNotes : t.salesTab.saveNotes}
            </Button>

            <div className="flex items-center gap-2">
              {(lead.status === "prd_ready" || lead.status === "reviewed") && (
                <Button onClick={() => doTransition("proposal_sent")} disabled={busy} size="sm">
                  <Send className="w-3.5 h-3.5 mr-1" />
                  {t.salesTab.sendProposal}
                </Button>
              )}
            </div>
          </div>
        </div>

        {lead.status === "proposal_sent" && (
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">$</span>
              <Input
                type="number"
                className="w-28 font-mono text-xs"
                value={amountDraft}
                onChange={(e) => setAmountDraft(e.target.value)}
              />
              <Button onClick={() => doTransition("won", { closedAmountUsd: Number(amountDraft) })} disabled={busy} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold">
                {t.salesTab.markWon}
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Input
                placeholder={t.salesTab.reasonPlaceholder}
                className="flex-1 text-xs"
                value={lostReasonDraft}
                onChange={(e) => setLostReasonDraft(e.target.value)}
              />
              <Button variant="outline" onClick={() => doTransition("lost", { lostReason: lostReasonDraft })} disabled={busy} size="sm">
                {t.salesTab.markLost}
              </Button>
            </div>
          </div>
        )}

        {lead.status === "won" && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            🎉 {t.salesTab.closedFor} <strong>${lead.closed_amount_usd}</strong> {lead.closed_at ? `(${new Date(lead.closed_at).toLocaleDateString()})` : ""}
          </div>
        )}

        {lead.status === "lost" && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-400 flex items-center justify-between">
            <span>{t.salesTab.lost}: {lead.lost_reason || "—"}</span>
            <Button variant="outline" size="sm" onClick={() => doTransition("proposal_sent")} disabled={busy}>
              Reopen Deal
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
