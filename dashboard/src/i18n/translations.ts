export type Lang = "es" | "en" | "pt";

export const LANG_LABELS: Record<Lang, string> = {
  es: "ES",
  en: "EN",
  pt: "PT",
};

export interface DashboardTranslations {
  nav: {
    title: string;
    proBadge: string;
    searchPlaceholder: string;
    allLeads: string;
    huntWizard: string;
    sources: string;
    signOut: string;
    language: string;
  };
  board: {
    title: string;
    actionHunt: string;
    actionSingle: string;
    total: string;
    hot: string;
    active: string;
    filterAll: string;
    filterHot: string;
    filterWarm: string;
    filterCold: string;
    emptyTitle: string;
    emptyDesc: string;
    loading: string;
    inProgress: string;
  };
  status: {
    discovered: string;
    scraping: string;
    scraped: string;
    audited: string;
    prd_ready: string;
    reviewed: string;
    proposal_sent: string;
    won: string;
    lost: string;
    failed: string;
  };
  tier: {
    hot: string;
    warm: string;
    cold: string;
  };
  verticals: {
    "website-redesign": string;
    "marketing-automation": string;
    "email-marketing": string;
    "social-media": string;
  };
  newLead: {
    title: string;
    urlLabel: string;
    urlPlaceholder: string;
    businessNameLabel: string;
    businessNamePlaceholder: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    langLabel: string;
    submitBusy: string;
    submitDefault: string;
  };
  huntWizard: {
    title: string;
    sessionActive: string;
    steps: {
      place: string;
      niches: string;
      run: string;
      interview: string;
      timeline: string;
    };
    placeLabel: string;
    placePlaceholder: string;
    langLabel: string;
    nextNiches: string;
    selectNiches: string;
    leadsPerNiche: string;
    customNicheName: string;
    customSearchQuery: string;
    customAdd: string;
    back: string;
    reviewRun: string;
    selectedNichesSummary: string;
    launchHunt: string;
    huntingLive: string;
    queued: string;
    found: string;
    discoveryComplete: string;
    generateOutreachPlan: string;
    outreachSetup: string;
    capacityLabel: string;
    channelLabel: string;
    channels: {
      whatsapp: string;
      call: string;
      email: string;
    };
    priorityLabel: string;
    up: string;
    down: string;
    generatingPlan: string;
    generatePlanBtn: string;
    timelineHeading: string;
    newHunt: string;
    viewAllLeads: string;
  };
  leadDetail: {
    loading: string;
    retry: string;
    tabs: {
      offer: string;
      sales: string;
      overview: string;
      audits: string;
      prds: string;
      timeline: string;
    };
  };
  auditsTab: {
    noAudits: string;
    qualifies: string;
    doesNotQualify: string;
    score: string;
    good: string;
    bad: string;
    fix: string;
    verticalsQualify: string;
  };
  salesTab: {
    thermometer: string;
    notScored: string;
    contact: string;
    messageWa: string;
    noPhone: string;
    notes: string;
    savingNotes: string;
    saveNotes: string;
    stage: string;
    sendProposal: string;
    markWon: string;
    reasonPlaceholder: string;
    markLost: string;
    closedFor: string;
    lost: string;
  };
  offerTab: {
    showcaseTitle: string;
    showcaseDesc: string;
    draftSuffix: string;
    preview: string;
    useAsShowcase: string;
    saving: string;
    save: string;
    openShowcase: string;
    offerTitle: string;
    noPrds: string;
    consultAddon: string;
    bundleTotal: string;
    stackNote: string;
  };
  prdsTab: {
    noPrds: string;
    downloadMd: string;
    loading: string;
  };
  overviewTab: {
    notCompleted: string;
    title: string;
    loadTime: string;
    emailCapture: string;
    phoneNumbers: string;
    yes: string;
    no: string;
  };
  timelineTab: {
    noEvents: string;
  };
  pipelineProgress: {
    title: string;
    failed: string;
    ready: string;
    discovered: string;
    scraping: string;
    auditing: string;
    startingAudits: string;
    generatingProposals: string;
    auditsCompleteWritingPrds: string;
    processing: string;
    stages: {
      discovered: string;
      scraping: string;
      audited: string;
      prd_ready: string;
    };
  };
  login: {
    signInTab: string;
    registerTab: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholderLogin: string;
    passwordPlaceholderRegister: string;
    submitBusy: string;
    submitSignIn: string;
    submitRegister: string;
    securityNote: string;
  };
}

export const translations: Record<Lang, DashboardTranslations> = {
  es: {
    nav: {
      title: "MoneyMachine",
      proBadge: "PRO",
      searchPlaceholder: "Buscar o comando...",
      allLeads: "Todos los leads",
      huntWizard: "Cazador",
      sources: "Fuentes",
      signOut: "Cerrar sesión",
      language: "Idioma",
    },
    board: {
      title: "Negociaciones en Pipeline",
      actionHunt: "Cazador de Leads",
      actionSingle: "Auditoría Directa URL",
      total: "Total",
      hot: "Calientes",
      active: "Activos",
      filterAll: "Todos",
      filterHot: "Calientes",
      filterWarm: "Tibios",
      filterCold: "Fríos",
      emptyTitle: "Aún no hay leads en la base de datos",
      emptyDesc: "Usa el Cazador de Leads arriba para descubrir prospectos locales o ingresa una URL.",
      loading: "Cargando leads…",
      inProgress: "En Progreso",
    },
    status: {
      discovered: "Descubierto",
      scraping: "Extrayendo sitio",
      scraped: "Sitio extraído",
      audited: "Auditado",
      prd_ready: "PRD Listo",
      reviewed: "Revisado",
      proposal_sent: "Propuesta Enviada",
      won: "Ganado",
      lost: "Perdido",
      failed: "Fallido",
    },
    tier: {
      hot: "CALIENTE",
      warm: "TIBIO",
      cold: "FRÍO",
    },
    verticals: {
      "website-redesign": "Rediseño de Sitio Web",
      "marketing-automation": "Automatización de Marketing",
      "email-marketing": "Email Marketing",
      "social-media": "Gestión de Redes Sociales",
    },
    newLead: {
      title: "Auditar un nuevo prospecto",
      urlLabel: "URL del sitio web *",
      urlPlaceholder: "https://sitio-cliente.com",
      businessNameLabel: "Nombre del negocio (opcional)",
      businessNamePlaceholder: "ej. Clínica Dental Sonrisas",
      categoryLabel: "Categoría (opcional)",
      categoryPlaceholder: "ej. Clínicas Dentales",
      langLabel: "Idioma de Auditoría",
      submitBusy: "Iniciando Pipeline Automático…",
      submitDefault: "Ejecutar Auditoría Completa",
    },
    huntWizard: {
      title: "Cazador de Leads (Descubrimiento Masivo)",
      sessionActive: "Sesión activa",
      steps: {
        place: "Lugar e Idioma",
        niches: "Nichos",
        run: "Revisar y Ejecutar",
        interview: "Entrevista",
        timeline: "Cronograma",
      },
      placeLabel: "Ciudad / Región Objetivo",
      placePlaceholder: "ej. Santa Cruz de la Sierra, Bolivia",
      langLabel: "Idioma de Auditorías y PRDs",
      nextNiches: "Siguiente: Elegir Nichos",
      selectNiches: "Seleccionar Nichos para Cazar",
      leadsPerNiche: "Leads por nicho:",
      customNicheName: "Nombre de Nicho Personalizado",
      customSearchQuery: "Consulta de Búsqueda",
      customAdd: "Agregar",
      back: "Atrás",
      reviewRun: "Revisar y Ejecutar",
      selectedNichesSummary: "nichos seleccionados • Objetivo:",
      launchHunt: "Iniciar Caza Automática",
      huntingLive: "Cazando en Google Places en vivo…",
      queued: "En cola",
      found: "encontrados",
      discoveryComplete: "¡Ciclo de descubrimiento completo! Pipelines iniciados.",
      generateOutreachPlan: "Generar Plan de Contacto",
      outreachSetup: "Configuración de Cadencia de Contacto",
      capacityLabel: "Leads que puedes contactar por semana:",
      channelLabel: "Canal Principal de Contacto",
      channels: {
        whatsapp: "WhatsApp",
        call: "Llamada",
        email: "Correo",
      },
      priorityLabel: "Prioridad de Nichos (orden de contacto)",
      up: "↑ Subir",
      down: "↓ Bajar",
      generatingPlan: "Generando Plan Estratégico con IA…",
      generatePlanBtn: "Generar Plan de Contacto Estratégico",
      timelineHeading: "Plan de Contacto Localizado",
      newHunt: "Nueva Caza",
      viewAllLeads: "Ver Todos los Leads Descubiertos",
    },
    leadDetail: {
      loading: "Cargando datos del lead…",
      retry: "Reintentar",
      tabs: {
        offer: "Oferta",
        sales: "Ventas",
        overview: "Resumen",
        audits: "Auditorías",
        prds: "PRDs",
        timeline: "Historial",
      },
    },
    auditsTab: {
      noAudits: "Aún no hay auditorías.",
      qualifies: "Califica",
      doesNotQualify: "No califica",
      score: "Puntaje",
      good: "Puntos Fuertes",
      bad: "Fricción / Fugas de Conversión",
      fix: "Solución Propuesta",
      verticalsQualify: "verticales califican",
    },
    salesTab: {
      thermometer: "Termómetro del Lead",
      notScored: "Aún no calificado — esperando auditorías.",
      contact: "Contacto Directo",
      messageWa: "Escribir por WhatsApp",
      noPhone: "No se encontró número de teléfono.",
      notes: "Notas del Operador",
      savingNotes: "Guardando…",
      saveNotes: "Guardar notas",
      stage: "Etapa de Venta",
      sendProposal: "Enviar Propuesta",
      markWon: "Marcar como Ganado",
      reasonPlaceholder: "Motivo de pérdida (opcional)",
      markLost: "Marcar como Perdido",
      closedFor: "Cerrado por",
      lost: "Perdido",
    },
    offerTab: {
      showcaseTitle: "Página de Demostración (Showcase)",
      showcaseDesc: "Envía esto primero — antes de explicar puntos débiles o precios. Los borradores automáticos abajo son el punto de partida listo para enviar.",
      draftSuffix: "borrador",
      preview: "Vista previa",
      useAsShowcase: "Usar como showcase",
      saving: "Guardando…",
      save: "Guardar",
      openShowcase: "Abrir página de showcase →",
      offerTitle: "Estructura de la Oferta",
      noPrds: "Sin ítems cotizados aún — esperando auditorías/PRDs.",
      consultAddon: "+ Adicional: 1 hora de consultoría estratégica con Hudson",
      bundleTotal: "Total del paquete completo",
      stackNote: "Cada ítem se puede vender por separado — comienza con el de menor fricción y mayor impacto, luego haz stack.",
    },
    prdsTab: {
      noPrds: "Aún no se generaron PRDs — es posible que este lead no haya calificado para ninguna vertical.",
      downloadMd: "Descargar .md",
      loading: "Cargando…",
    },
    overviewTab: {
      notCompleted: "La extracción del sitio aún no ha finalizado.",
      title: "Título",
      loadTime: "Tiempo de carga",
      emailCapture: "Captura de emails",
      phoneNumbers: "Teléfonos detectados",
      yes: "Sí",
      no: "No",
    },
    timelineTab: {
      noEvents: "Aún no hay eventos registrados.",
    },
    pipelineProgress: {
      title: "Progreso del Pipeline",
      failed: "Pipeline Fallido",
      ready: "Auditorías y Propuestas Listas",
      discovered: "Descubierto • En cola",
      scraping: "Extrayendo DOM y Capturas...",
      auditing: "Auditando verticales...",
      startingAudits: "Iniciando 4 Auditorías Verticales...",
      generatingProposals: "Generando Propuestas...",
      auditsCompleteWritingPrds: "4/4 Auditorías Listas • Redactando PRDs...",
      processing: "Procesando Lead...",
      stages: {
        discovered: "Descubierto",
        scraping: "Extrayendo Sitio",
        audited: "4 Auditorías",
        prd_ready: "Propuesta y PRD",
      },
    },
    login: {
      signInTab: "Iniciar Sesión",
      registerTab: "Crear Cuenta",
      subtitle: "Inicia sesión o crea tu cuenta de operador",
      nameLabel: "Nombre Completo",
      namePlaceholder: "Hudson Argollo",
      emailLabel: "Correo Electrónico",
      emailPlaceholder: "operador@clubemkt.digital",
      passwordLabel: "Contraseña",
      passwordPlaceholderLogin: "••••••••",
      passwordPlaceholderRegister: "Mínimo 6 caracteres",
      submitBusy: "Autenticando…",
      submitSignIn: "Iniciar Sesión",
      submitRegister: "Crear Cuenta y Entrar",
      securityNote: "Sesión Encriptada PBKDF2-SHA256",
    },
  },

  en: {
    nav: {
      title: "MoneyMachine",
      proBadge: "PRO",
      searchPlaceholder: "Search or command...",
      allLeads: "All leads",
      huntWizard: "Hunt Wizard",
      sources: "Sources",
      signOut: "Sign out",
      language: "Language",
    },
    board: {
      title: "Pipeline Deals",
      actionHunt: "Hunt Wizard",
      actionSingle: "Direct URL Audit",
      total: "Total",
      hot: "Hot",
      active: "Active",
      filterAll: "All",
      filterHot: "Hot",
      filterWarm: "Warm",
      filterCold: "Cold",
      emptyTitle: "No leads in the database yet",
      emptyDesc: "Use the Hunt Wizard above to hunt real local prospects or enter a single URL.",
      loading: "Loading leads…",
      inProgress: "In Progress",
    },
    status: {
      discovered: "Discovered",
      scraping: "Scraping Site",
      scraped: "Site Scraped",
      audited: "Audited",
      prd_ready: "PRD Ready",
      reviewed: "Reviewed",
      proposal_sent: "Proposal Sent",
      won: "Won",
      lost: "Lost",
      failed: "Failed",
    },
    tier: {
      hot: "HOT",
      warm: "WARM",
      cold: "COLD",
    },
    verticals: {
      "website-redesign": "Website Redesign",
      "marketing-automation": "Marketing Automation",
      "email-marketing": "Email Marketing",
      "social-media": "Social Media Management",
    },
    newLead: {
      title: "Audit a new prospect",
      urlLabel: "Website URL *",
      urlPlaceholder: "https://client-website.com",
      businessNameLabel: "Business Name (optional)",
      businessNamePlaceholder: "e.g. BrightSmile Dental",
      categoryLabel: "Category (optional)",
      categoryPlaceholder: "e.g. Dental Clinics",
      langLabel: "Audit Language",
      submitBusy: "Starting Automated Pipeline…",
      submitDefault: "Run Full Pipeline Audit",
    },
    huntWizard: {
      title: "Hunt Wizard (City & Niche Discovery)",
      sessionActive: "Session active",
      steps: {
        place: "Place & Language",
        niches: "Niches",
        run: "Review & Run",
        interview: "Interview",
        timeline: "Timeline",
      },
      placeLabel: "Target City / Region",
      placePlaceholder: "e.g. Santa Cruz de la Sierra, Bolivia",
      langLabel: "Audits & PRD Language",
      nextNiches: "Next: Select Niches",
      selectNiches: "Select Niches to Hunt",
      leadsPerNiche: "Leads per niche:",
      customNicheName: "Custom Niche Name",
      customSearchQuery: "Search Query",
      customAdd: "Add",
      back: "Back",
      reviewRun: "Review & Run",
      selectedNichesSummary: "niches selected • Target:",
      launchHunt: "Launch Automated Hunt",
      huntingLive: "Hunting Google Places live…",
      queued: "Queued",
      found: "found",
      discoveryComplete: "Discovery cycle complete! Pipelines initiated.",
      generateOutreachPlan: "Generate Outreach Plan",
      outreachSetup: "Outreach Cadence Setup",
      capacityLabel: "Leads you can contact per week:",
      channelLabel: "Primary Outreach Channel",
      channels: {
        whatsapp: "WhatsApp",
        call: "Call",
        email: "Email",
      },
      priorityLabel: "Niche Priority Ordering",
      up: "↑ Up",
      down: "↓ Down",
      generatingPlan: "Generating Strategic AI Gameplan…",
      generatePlanBtn: "Generate Strategic Outreach Plan",
      timelineHeading: "Localized Outreach Gameplan",
      newHunt: "New Hunt",
      viewAllLeads: "View All Discovered Leads",
    },
    leadDetail: {
      loading: "Loading lead data…",
      retry: "Retry",
      tabs: {
        offer: "Offer",
        sales: "Sales",
        overview: "Overview",
        audits: "Audits",
        prds: "PRDs",
        timeline: "Timeline",
      },
    },
    auditsTab: {
      noAudits: "No audits yet.",
      qualifies: "Qualifies",
      doesNotQualify: "Does not qualify",
      score: "Score",
      good: "Good",
      bad: "Friction / Leaks",
      fix: "Proposed Fix",
      verticalsQualify: "verticals qualify",
    },
    salesTab: {
      thermometer: "Lead Thermometer",
      notScored: "Not scored yet — waiting on audits.",
      contact: "Direct Contact",
      messageWa: "Message on WhatsApp",
      noPhone: "No phone number found.",
      notes: "Operator Notes",
      savingNotes: "Saving…",
      saveNotes: "Save notes",
      stage: "Sales Stage",
      sendProposal: "Send Proposal",
      markWon: "Mark Won",
      reasonPlaceholder: "Reason (optional)",
      markLost: "Mark Lost",
      closedFor: "Closed for",
      lost: "Lost",
    },
    offerTab: {
      showcaseTitle: "Showcase Page",
      showcaseDesc: "Send this first — before walking the prospect through pain points or pricing. Auto-generated drafts below are ready to review and send.",
      draftSuffix: "draft",
      preview: "Preview",
      useAsShowcase: "Use as showcase",
      saving: "Saving…",
      save: "Save",
      openShowcase: "Open showcase page →",
      offerTitle: "Offer Breakdown",
      noPrds: "No priced line items yet — waiting on audits/PRDs.",
      consultAddon: "+ Add-on: 1-hour strategy consultation with Hudson",
      bundleTotal: "Full bundle total",
      stackNote: "Each line item is also sellable standalone at its own price — lead with the cheapest, highest-impact one, then stack.",
    },
    prdsTab: {
      noPrds: "No PRDs generated yet — this lead may not have qualified for any vertical.",
      downloadMd: "Download .md",
      loading: "Loading…",
    },
    overviewTab: {
      notCompleted: "Scrape hasn't completed yet.",
      title: "Title",
      loadTime: "Load time",
      emailCapture: "Email capture form",
      phoneNumbers: "Phone numbers found",
      yes: "Yes",
      no: "No",
    },
    timelineTab: {
      noEvents: "No events recorded yet.",
    },
    pipelineProgress: {
      title: "Pipeline Progression",
      failed: "Pipeline Failed",
      ready: "Audits & Proposal Ready",
      discovered: "Discovered • Queued",
      scraping: "Scraping DOM & Screenshot...",
      auditing: "Auditing verticals...",
      startingAudits: "Starting 4-Vertical Audits...",
      generatingProposals: "Generating Proposals...",
      auditsCompleteWritingPrds: "Audits 4/4 Complete • Writing PRDs...",
      processing: "Processing Lead...",
      stages: {
        discovered: "Discovered",
        scraping: "Scraping Site",
        audited: "4-Vertical Audit",
        prd_ready: "Proposal & PRD",
      },
    },
    login: {
      signInTab: "Sign In",
      registerTab: "Create Account",
      subtitle: "Sign in or create your operator account",
      nameLabel: "Full Name",
      namePlaceholder: "Hudson Argollo",
      emailLabel: "Email Address",
      emailPlaceholder: "operator@clubemkt.digital",
      passwordLabel: "Password",
      passwordPlaceholderLogin: "••••••••",
      passwordPlaceholderRegister: "At least 6 characters",
      submitBusy: "Authenticating…",
      submitSignIn: "Sign In",
      submitRegister: "Create Account & Enter",
      securityNote: "PBKDF2-SHA256 Encrypted Session",
    },
  },

  pt: {
    nav: {
      title: "MoneyMachine",
      proBadge: "PRO",
      searchPlaceholder: "Buscar ou comando...",
      allLeads: "Todos os leads",
      huntWizard: "Caçador",
      sources: "Fontes",
      signOut: "Sair",
      language: "Idioma",
    },
    board: {
      title: "Negociações no Pipeline",
      actionHunt: "Caçador de Leads",
      actionSingle: "Auditoria Direta URL",
      total: "Total",
      hot: "Quentes",
      active: "Ativos",
      filterAll: "Todos",
      filterHot: "Quentes",
      filterWarm: "Mornos",
      filterCold: "Frios",
      emptyTitle: "Nenhum lead no banco de dados ainda",
      emptyDesc: "Use o Caçador de Leads acima para descobrir prospectos locais ou insira uma URL.",
      loading: "Carregando leads…",
      inProgress: "Em Progresso",
    },
    status: {
      discovered: "Descoberto",
      scraping: "Extraindo site",
      scraped: "Site extraído",
      audited: "Auditado",
      prd_ready: "PRD Pronto",
      reviewed: "Revisado",
      proposal_sent: "Proposta Enviada",
      won: "Ganho",
      lost: "Perdido",
      failed: "Falhou",
    },
    tier: {
      hot: "QUENTE",
      warm: "MORNO",
      cold: "FRIO",
    },
    verticals: {
      "website-redesign": "Redesign de Website",
      "marketing-automation": "Automação de Marketing",
      "email-marketing": "Email Marketing",
      "social-media": "Gestão de Redes Sociais",
    },
    newLead: {
      title: "Auditar um novo prospecto",
      urlLabel: "URL do site *",
      urlPlaceholder: "https://site-cliente.com.br",
      businessNameLabel: "Nome do negócio (opcional)",
      businessNamePlaceholder: "ex. Clínica Odontológica Sorrir",
      categoryLabel: "Categoria (opcional)",
      categoryPlaceholder: "ex. Clínicas Odontológicas",
      langLabel: "Idioma da Auditoria",
      submitBusy: "Iniciando Pipeline Automático…",
      submitDefault: "Executar Auditoria Completa",
    },
    huntWizard: {
      title: "Caçador de Leads (Descoberta em Massa)",
      sessionActive: "Sessão ativa",
      steps: {
        place: "Local e Idioma",
        niches: "Nichos",
        run: "Revisar e Executar",
        interview: "Entrevista",
        timeline: "Cronograma",
      },
      placeLabel: "Cidade / Região Alvo",
      placePlaceholder: "ex. São Paulo, SP",
      langLabel: "Idioma das Auditorias e PRDs",
      nextNiches: "Próximo: Escolher Nichos",
      selectNiches: "Selecionar Nichos para Caçar",
      leadsPerNiche: "Leads por nicho:",
      customNicheName: "Nome do Nicho Personalizado",
      customSearchQuery: "Consulta de Busca",
      customAdd: "Adicionar",
      back: "Voltar",
      reviewRun: "Revisar e Executar",
      selectedNichesSummary: "nichos selecionados • Alvo:",
      launchHunt: "Iniciar Caça Automática",
      huntingLive: "Caçando no Google Places ao vivo…",
      queued: "Na fila",
      found: "encontrados",
      discoveryComplete: "Ciclo de descoberta concluído! Pipelines iniciados.",
      generateOutreachPlan: "Gerar Plano de Contato",
      outreachSetup: "Configuração de Cadência de Contato",
      capacityLabel: "Leads que você consegue contatar por semana:",
      channelLabel: "Canal Principal de Contato",
      channels: {
        whatsapp: "WhatsApp",
        call: "Ligação",
        email: "E-mail",
      },
      priorityLabel: "Prioridade dos Nichos",
      up: "↑ Subir",
      down: "↓ Descer",
      generatingPlan: "Gerando Plano Estratégico com IA…",
      generatePlanBtn: "Gerar Plano de Contato Estratégico",
      timelineHeading: "Plano de Contato Localizado",
      newHunt: "Nova Caça",
      viewAllLeads: "Ver Todos os Leads Descobertos",
    },
    leadDetail: {
      loading: "Carregando dados do lead…",
      retry: "Tentar novamente",
      tabs: {
        offer: "Oferta",
        sales: "Vendas",
        overview: "Visão Geral",
        audits: "Auditorias",
        prds: "PRDs",
        timeline: "Histórico",
      },
    },
    auditsTab: {
      noAudits: "Nenhuma auditoria ainda.",
      qualifies: "Qualifica",
      doesNotQualify: "Não qualifica",
      score: "Pontuação",
      good: "Pontos Fortes",
      bad: "Fricção / Fugas de Conversão",
      fix: "Solução Proposta",
      verticalsQualify: "verticais qualificam",
    },
    salesTab: {
      thermometer: "Termômetro do Lead",
      notScored: "Ainda não pontuado — aguardando auditorias.",
      contact: "Contato Direto",
      messageWa: "Conversar no WhatsApp",
      noPhone: "Nenhum número de telefone encontrado.",
      notes: "Notas do Operador",
      savingNotes: "Salvando…",
      saveNotes: "Salvar notas",
      stage: "Etapa de Venda",
      sendProposal: "Enviar Proposta",
      markWon: "Marcar como Ganho",
      reasonPlaceholder: "Motivo da perda (opcional)",
      markLost: "Marcar como Perdido",
      closedFor: "Fechado por",
      lost: "Perdido",
    },
    offerTab: {
      showcaseTitle: "Página de Demonstração (Showcase)",
      showcaseDesc: "Envie isto primeiro — antes de explicar problemas ou preços. Os rascunhos automáticos abaixo são o ponto de partida pronto para envio.",
      draftSuffix: "rascunho",
      preview: "Visualizar",
      useAsShowcase: "Usar como showcase",
      saving: "Salvando…",
      save: "Salvar",
      openShowcase: "Abrir página de showcase →",
      offerTitle: "Estrutura da Proposta",
      noPrds: "Sem itens cotados ainda — aguardando auditorias/PRDs.",
      consultAddon: "+ Adicional: 1 hora de consultoria estratégica com Hudson",
      bundleTotal: "Total do pacote completo",
      stackNote: "Cada item pode ser vendido separadamente — comece pelo de menor atrito e maior impacto, depois empilhe.",
    },
    prdsTab: {
      noPrds: "Nenhum PRD gerado ainda — este lead pode não ter se qualificado para nenhuma vertical.",
      downloadMd: "Baixar .md",
      loading: "Carregando…",
    },
    overviewTab: {
      notCompleted: "A extração do site ainda não foi concluída.",
      title: "Título",
      loadTime: "Tempo de carregamento",
      emailCapture: "Captura de emails",
      phoneNumbers: "Telefones encontrados",
      yes: "Sim",
      no: "Não",
    },
    timelineTab: {
      noEvents: "Nenhum evento registrado ainda.",
    },
    pipelineProgress: {
      title: "Progresso do Pipeline",
      failed: "Pipeline Falhou",
      ready: "Auditorias e Propostas Prontas",
      discovered: "Descoberto • Na fila",
      scraping: "Extraindo DOM e Capturas...",
      auditing: "Auditando verticais...",
      startingAudits: "Iniciando 4 Auditorias Verticais...",
      generatingProposals: "Gerando Propostas...",
      auditsCompleteWritingPrds: "4/4 Auditorias Prontas • Redigindo PRDs...",
      processing: "Processando Lead...",
      stages: {
        discovered: "Descoberto",
        scraping: "Extraindo Site",
        audited: "4 Auditorias",
        prd_ready: "Proposta e PRD",
      },
    },
    login: {
      signInTab: "Entrar",
      registerTab: "Criar Conta",
      subtitle: "Entre ou crie sua conta de operador",
      nameLabel: "Nome Completo",
      namePlaceholder: "Hudson Argollo",
      emailLabel: "E-mail",
      emailPlaceholder: "operador@clubemkt.digital",
      passwordLabel: "Senha",
      passwordPlaceholderLogin: "••••••••",
      passwordPlaceholderRegister: "Mínimo 6 caracteres",
      submitBusy: "Autenticando…",
      submitSignIn: "Entrar",
      submitRegister: "Criar Conta e Entrar",
      securityNote: "Sessão Criptografada PBKDF2-SHA256",
    },
  },
};
