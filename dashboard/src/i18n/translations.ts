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
