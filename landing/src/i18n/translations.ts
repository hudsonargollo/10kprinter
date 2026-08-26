export type Lang = "en" | "pt" | "es";

export const LANG_LABELS: Record<Lang, string> = { en: "EN", pt: "PT", es: "ES" };

export interface Translation {
  nav: {
    links: { howItWorks: string; features: string; pricing: string; faq: string };
    dashboard: string;
    bookCall: string;
  };
  hero: {
    headline: [string, string, string];
    sub: string;
    bookCall: string;
    seeHowItWorks: string;
    offerAlt: string;
  };
  howItWorks: {
    heading: string;
    steps: { n: string; title: string; body: string }[];
    bookCall: string;
    viewDashboard: string;
  };
  setup: {
    heading: string;
    sub: string;
    huntWizardAlt: string;
    liveRun: string;
    niches: string[];
    nicheStatus: [string, string, string];
  };
  statement: { heading: string; auditsAlt: string };
  features: {
    audits: { title: string; body: string; alt: string };
    pricing: { title: string; body: string; alt: string };
    sales: { title: string; body: string; alt: string };
    hunt: { title: string; body: string; alt: string };
  };
  useCase: { badge: string; heading: string; salesAlt: string };
  valueStrip: { items: { title: string; body: string }[] };
  offerTiers: {
    heading: string;
    sub: string;
    tiers: { name: string; price: string; body: string }[];
  };
  faq: { heading: string; items: { q: string; a: string }[] };
  cta: {
    heading: string;
    sub: string;
    bookCall: string;
    bigLine1: string;
    bigLine2: string;
    footer: { howItWorks: string; pricing: string; faq: string; dashboard: string };
  };
}

export const translations: Record<Lang, Translation> = {
  en: {
    nav: {
      links: { howItWorks: "How it works", features: "Features", pricing: "Pricing", faq: "FAQ" },
      dashboard: "Dashboard",
      bookCall: "Book a call",
    },
    hero: {
      headline: ["It finds the leads.", "It writes the pitch.", "You close."],
      sub: "MoneyMachine hunts local businesses with a weak digital presence, audits them like a paid conversion consultant would, and writes a priced, ready-to-send proposal — before you've made first contact.",
      bookCall: "Book a call",
      seeHowItWorks: "See how it works",
      offerAlt: "MoneyMachine's Offer tab, showing itemized pricing for a real lead",
    },
    howItWorks: {
      heading: "How it works",
      steps: [
        { n: "01", title: "Hunt", body: "Point it at a city and a niche. It finds real local businesses with real websites — dentists, law firms, restaurants, whatever you sell into." },
        { n: "02", title: "Audit", body: "Every site gets audited like a paid conversion consultant would: what's working, what's leaking revenue, and exactly how to fix it." },
        { n: "03", title: "Price & Pitch", body: "Findings become a priced, itemized proposal automatically — no blank page, no guesswork on what to charge." },
        { n: "04", title: "Close", body: "Track every lead through a real pipeline — hot/warm/cold scoring, notes, WhatsApp, and the deal size when it closes." },
      ],
      bookCall: "Book a call",
      viewDashboard: "View the dashboard",
    },
    setup: {
      heading: "Set up in minutes",
      sub: "Pick a place and a niche package. No CRM to configure, no lead list to buy.",
      huntWizardAlt: "The Hunt Wizard's niche-selection step, showing 8 predefined business niches",
      liveRun: "Live run",
      niches: ["Dental Clinics", "Law Firms", "Real Estate"],
      nicheStatus: ["18 found", "20 found", "running…"],
    },
    statement: {
      heading: "Everything a conversion consultant does, now automatic.",
      auditsAlt: "A real audit for a dental clinic, showing good, bad, and fix findings",
    },
    features: {
      audits: {
        title: "Real audits, not generic advice",
        body: "Every finding is specific to the actual business — what's good, what's leaking revenue, and exactly how to fix it. No boilerplate checklists.",
        alt: "A real audit for a dental clinic, showing good/bad/fix findings",
      },
      pricing: {
        title: "Pricing that's already done for you",
        body: "Findings become an itemized, priced offer automatically — lead with the cheapest line item, then stack toward the full bundle.",
        alt: "An itemized offer with pricing per service and a bundle total",
      },
      sales: {
        title: "A thermometer for every lead",
        body: "Hot, warm, cold — scored from the audit itself. Track notes, message on WhatsApp, and move every deal through a real pipeline.",
        alt: "A lead's sales tab showing its hot/warm/cold score and WhatsApp contact button",
      },
      hunt: {
        title: "Self-serve discovery, one city at a time",
        body: "Pick a place, pick niches, run the hunt. Live progress per niche, no manual API calls.",
        alt: "The Hunt Wizard's niche-selection step",
      },
    },
    useCase: {
      badge: "LIVE NOW",
      heading: "MoneyMachine in production",
      salesAlt: "A real lead's Sales tab, showing its hot/warm/cold score and a WhatsApp contact button",
    },
    valueStrip: {
      items: [
        { title: "Real businesses, not stale lists", body: "Discovered fresh from Google Places, deduped, filtered to businesses that actually have a website to audit." },
        { title: "The full pipeline, not a mockup", body: "Scrape, audit, PRD, and sales tracking all run end to end on real leads, today." },
        { title: "Priced automatically", body: "Every finding becomes an itemized dollar amount — no blank page when it's time to quote." },
        { title: "Your API keys, your data", body: "Runs on your own Anthropic and Google Places accounts. Nothing shared, nothing resold." },
      ],
    },
    offerTiers: {
      heading: "Priced the way it actually sells",
      sub: "No flat multi-thousand-dollar quote. Itemized line items, stacked into a bundle only when the audit says they should be.",
      tiers: [
        { name: "Quick Win", price: "$200", body: "One line item — a single audited fix, priced and ready to pitch on its own." },
        { name: "Stack & Save", price: "$200 × N", body: "Qualify for more than one vertical? Stack them — each one still priced independently." },
        { name: "Consult Add-on", price: "+$100", body: "A standing 1-hour strategy consultation with Hudson, offered on every lead." },
        { name: "Full Bundle", price: "The total", body: "Every qualifying line item plus the consult add-on, summed automatically on the Offer tab." },
      ],
    },
    faq: {
      heading: "FAQ",
      items: [
        { q: "Which regions and niches are supported?", a: "Any region Google Places covers. There's a predefined package of 8 niches (dental clinics, real estate, law firms, restaurants, gyms, auto repair, beauty salons, general contractors) — chain-prone categories like hotel franchises are deliberately excluded. Custom niches work too." },
        { q: "Do you contact leads for me?", a: "No — MoneyMachine finds and audits businesses and drafts the pitch. Outreach (WhatsApp, calls, email) is still you, though a hot/warm/cold score and a suggested weekly cadence come with every batch." },
        { q: "What does the audit actually check?", a: "Real conversion friction on the live site — decision fatigue, missing lead capture, no email or social follow-up path, unprofessional assets — scored per service line, with specific findings tied to the actual page, not a generic checklist." },
        { q: "Is my data private?", a: "It runs on your own Anthropic and Google Places API keys. Nothing is shared across accounts or resold." },
        { q: "What LLM/API keys does this use?", a: "Anthropic Claude for audits, PRDs, and outreach timelines; Google Places for discovery and autocomplete. Bring your own keys for both." },
      ],
    },
    cta: {
      heading: "Built by Hudson. Running live right now.",
      sub: "See MoneyMachine work on a real city and niche of your choosing.",
      bookCall: "Book a call",
      bigLine1: "THE MACHINE THAT",
      bigLine2: "FINDS YOUR NEXT CLIENT.",
      footer: { howItWorks: "How it works", pricing: "Pricing", faq: "FAQ", dashboard: "Dashboard" },
    },
  },

  pt: {
    nav: {
      links: { howItWorks: "Como funciona", features: "Recursos", pricing: "Preços", faq: "Perguntas" },
      dashboard: "Painel",
      bookCall: "Agendar conversa",
    },
    hero: {
      headline: ["Ela encontra os leads.", "Ela escreve a proposta.", "Você fecha."],
      sub: "A MoneyMachine caça negócios locais com presença digital fraca, audita cada um como um consultor de conversão pago faria, e escreve uma proposta precificada e pronta para enviar — antes mesmo do primeiro contato.",
      bookCall: "Agendar conversa",
      seeHowItWorks: "Ver como funciona",
      offerAlt: "Aba de Oferta da MoneyMachine, mostrando preços detalhados de um lead real",
    },
    howItWorks: {
      heading: "Como funciona",
      steps: [
        { n: "01", title: "Caçar", body: "Aponte para uma cidade e um nicho. Ela encontra negócios locais reais com sites reais — dentistas, escritórios de advocacia, restaurantes, o que você vender." },
        { n: "02", title: "Auditar", body: "Todo site é auditado como um consultor de conversão pago faria: o que funciona, onde está vazando receita, e exatamente como corrigir." },
        { n: "03", title: "Precificar e Propor", body: "Os achados viram uma proposta precificada e detalhada automaticamente — sem folha em branco, sem chute no preço." },
        { n: "04", title: "Fechar", body: "Acompanhe cada lead num pipeline de verdade — pontuação quente/morno/frio, anotações, WhatsApp, e o valor do negócio quando fecha." },
      ],
      bookCall: "Agendar conversa",
      viewDashboard: "Ver o painel",
    },
    setup: {
      heading: "Configure em minutos",
      sub: "Escolha um lugar e um pacote de nichos. Sem CRM para configurar, sem lista de leads para comprar.",
      huntWizardAlt: "Etapa de seleção de nichos do Hunt Wizard, mostrando 8 nichos de negócio predefinidos",
      liveRun: "Execução ao vivo",
      niches: ["Clínicas Odontológicas", "Escritórios de Advocacia", "Imobiliárias"],
      nicheStatus: ["18 encontrados", "20 encontrados", "em andamento…"],
    },
    statement: {
      heading: "Tudo que um consultor de conversão faz, agora automático.",
      auditsAlt: "Uma auditoria real de uma clínica odontológica, mostrando pontos bons, ruins e correções",
    },
    features: {
      audits: {
        title: "Auditorias reais, não conselhos genéricos",
        body: "Cada achado é específico do negócio real — o que está bom, onde está vazando receita, e exatamente como corrigir. Sem checklists genéricos.",
        alt: "Uma auditoria real de uma clínica odontológica, mostrando achados de bom/ruim/correção",
      },
      pricing: {
        title: "Precificação já pronta para você",
        body: "Os achados viram uma oferta detalhada e precificada automaticamente — comece pelo item mais barato, depois empilhe até o pacote completo.",
        alt: "Uma oferta detalhada com preço por serviço e o total do pacote",
      },
      sales: {
        title: "Um termômetro para cada lead",
        body: "Quente, morno, frio — pontuado a partir da própria auditoria. Acompanhe anotações, converse pelo WhatsApp, e mova cada negociação num pipeline de verdade.",
        alt: "A aba de vendas de um lead mostrando sua pontuação quente/morno/frio e o botão de contato no WhatsApp",
      },
      hunt: {
        title: "Descoberta self-service, uma cidade de cada vez",
        body: "Escolha um lugar, escolha os nichos, rode a busca. Progresso ao vivo por nicho, sem chamadas de API manuais.",
        alt: "Etapa de seleção de nichos do Hunt Wizard",
      },
    },
    useCase: {
      badge: "NO AR",
      heading: "MoneyMachine em produção",
      salesAlt: "A aba de vendas de um lead real, mostrando sua pontuação quente/morno/frio e o botão de contato no WhatsApp",
    },
    valueStrip: {
      items: [
        { title: "Negócios reais, não listas velhas", body: "Descobertos direto do Google Places, sem duplicatas, filtrados para negócios que realmente têm um site para auditar." },
        { title: "O pipeline completo, não uma maquete", body: "Raspagem, auditoria, PRD e acompanhamento de vendas rodam de ponta a ponta em leads reais, hoje." },
        { title: "Precificado automaticamente", body: "Cada achado vira um valor detalhado em dólares — sem folha em branco na hora de cotar." },
        { title: "Suas chaves de API, seus dados", body: "Roda nas suas próprias contas Anthropic e Google Places. Nada é compartilhado, nada é revendido." },
      ],
    },
    offerTiers: {
      heading: "Precificado do jeito que realmente vende",
      sub: "Sem orçamento fechado de vários milhares de dólares. Itens detalhados, empilhados num pacote só quando a auditoria indica que devem ser.",
      tiers: [
        { name: "Vitória Rápida", price: "US$ 200", body: "Um item — uma única correção auditada, precificada e pronta para propor sozinha." },
        { name: "Empilhe e Economize", price: "US$ 200 × N", body: "Qualificou para mais de um serviço? Empilhe — cada um continua precificado de forma independente." },
        { name: "Consultoria Extra", price: "+US$ 100", body: "Uma consultoria estratégica de 1 hora com o Hudson, oferecida em todo lead." },
        { name: "Pacote Completo", price: "O total", body: "Todo item qualificado mais a consultoria extra, somados automaticamente na aba de Oferta." },
      ],
    },
    faq: {
      heading: "Perguntas frequentes",
      items: [
        { q: "Quais regiões e nichos são suportados?", a: "Qualquer região que o Google Places cubra. Há um pacote predefinido de 8 nichos (clínicas odontológicas, imobiliárias, escritórios de advocacia, restaurantes, academias, oficinas mecânicas, salões de beleza, empreiteiras) — categorias propensas a redes, como franquias de hotéis, são deliberadamente excluídas. Nichos personalizados também funcionam." },
        { q: "Vocês contatam os leads por mim?", a: "Não — a MoneyMachine encontra e audita os negócios e redige a proposta. O contato (WhatsApp, ligações, e-mail) ainda é com você, mas cada lote já vem com uma pontuação quente/morno/frio e uma cadência semanal sugerida." },
        { q: "O que a auditoria realmente verifica?", a: "Fricção de conversão real no site ao vivo — fadiga de decisão, falta de captura de lead, nenhum caminho de acompanhamento por e-mail ou redes sociais, materiais pouco profissionais — pontuado por linha de serviço, com achados específicos ligados à página real, não um checklist genérico." },
        { q: "Meus dados ficam privados?", a: "Ela roda com suas próprias chaves de API da Anthropic e do Google Places. Nada é compartilhado entre contas nem revendido." },
        { q: "Quais chaves de LLM/API ela usa?", a: "Anthropic Claude para auditorias, PRDs e cronogramas de contato; Google Places para descoberta e autocompletar. Traga suas próprias chaves para os dois." },
      ],
    },
    cta: {
      heading: "Construído pelo Hudson. Rodando ao vivo agora.",
      sub: "Veja a MoneyMachine funcionar numa cidade e nicho reais, à sua escolha.",
      bookCall: "Agendar conversa",
      bigLine1: "A MÁQUINA QUE",
      bigLine2: "ENCONTRA SEU PRÓXIMO CLIENTE.",
      footer: { howItWorks: "Como funciona", pricing: "Preços", faq: "Perguntas", dashboard: "Painel" },
    },
  },

  es: {
    nav: {
      links: { howItWorks: "Cómo funciona", features: "Funciones", pricing: "Precios", faq: "Preguntas" },
      dashboard: "Panel",
      bookCall: "Agendar llamada",
    },
    hero: {
      headline: ["Encuentra los leads.", "Escribe la propuesta.", "Tú cierras."],
      sub: "MoneyMachine rastrea negocios locales con presencia digital débil, audita cada uno como lo haría un consultor de conversión pago, y redacta una propuesta con precio y lista para enviar — antes de que hagas el primer contacto.",
      bookCall: "Agendar llamada",
      seeHowItWorks: "Ver cómo funciona",
      offerAlt: "Pestaña de Oferta de MoneyMachine, mostrando precios detallados de un lead real",
    },
    howItWorks: {
      heading: "Cómo funciona",
      steps: [
        { n: "01", title: "Rastrear", body: "Apúntala a una ciudad y un nicho. Encuentra negocios locales reales con sitios web reales — dentistas, bufetes, restaurantes, lo que sea que vendas." },
        { n: "02", title: "Auditar", body: "Cada sitio se audita como lo haría un consultor de conversión pago: qué funciona, dónde se pierden ingresos, y exactamente cómo corregirlo." },
        { n: "03", title: "Cotizar y Proponer", body: "Los hallazgos se convierten automáticamente en una propuesta con precio y desglosada — sin hoja en blanco, sin adivinar cuánto cobrar." },
        { n: "04", title: "Cerrar", body: "Sigue cada lead en un pipeline real — puntaje caliente/tibio/frío, notas, WhatsApp, y el monto del trato cuando se cierra." },
      ],
      bookCall: "Agendar llamada",
      viewDashboard: "Ver el panel",
    },
    setup: {
      heading: "Configúralo en minutos",
      sub: "Elige un lugar y un paquete de nichos. Sin CRM que configurar, sin lista de leads que comprar.",
      huntWizardAlt: "Paso de selección de nichos del Hunt Wizard, mostrando 8 nichos de negocio predefinidos",
      liveRun: "Ejecución en vivo",
      niches: ["Clínicas Dentales", "Bufetes de Abogados", "Bienes Raíces"],
      nicheStatus: ["18 encontrados", "20 encontrados", "en curso…"],
    },
    statement: {
      heading: "Todo lo que hace un consultor de conversión, ahora automático.",
      auditsAlt: "Una auditoría real de una clínica dental, mostrando hallazgos buenos, malos y correcciones",
    },
    features: {
      audits: {
        title: "Auditorías reales, no consejos genéricos",
        body: "Cada hallazgo es específico del negocio real — qué está bien, dónde se pierden ingresos, y exactamente cómo corregirlo. Sin listas de verificación genéricas.",
        alt: "Una auditoría real de una clínica dental, mostrando hallazgos de bueno/malo/corrección",
      },
      pricing: {
        title: "Precios ya resueltos por ti",
        body: "Los hallazgos se convierten automáticamente en una oferta desglosada y con precio — empieza por el ítem más barato, luego suma hacia el paquete completo.",
        alt: "Una oferta desglosada con precio por servicio y el total del paquete",
      },
      sales: {
        title: "Un termómetro para cada lead",
        body: "Caliente, tibio, frío — puntuado a partir de la propia auditoría. Sigue notas, escribe por WhatsApp, y mueve cada negociación en un pipeline real.",
        alt: "La pestaña de ventas de un lead mostrando su puntaje caliente/tibio/frío y el botón de contacto de WhatsApp",
      },
      hunt: {
        title: "Descubrimiento autoservicio, una ciudad a la vez",
        body: "Elige un lugar, elige los nichos, ejecuta la búsqueda. Progreso en vivo por nicho, sin llamadas manuales a la API.",
        alt: "Paso de selección de nichos del Hunt Wizard",
      },
    },
    useCase: {
      badge: "EN VIVO",
      heading: "MoneyMachine en producción",
      salesAlt: "La pestaña de ventas de un lead real, mostrando su puntaje caliente/tibio/frío y el botón de contacto de WhatsApp",
    },
    valueStrip: {
      items: [
        { title: "Negocios reales, no listas viejas", body: "Descubiertos directamente de Google Places, sin duplicados, filtrados a negocios que realmente tienen un sitio web para auditar." },
        { title: "El pipeline completo, no una maqueta", body: "Extracción, auditoría, PRD y seguimiento de ventas corren de punta a punta con leads reales, hoy." },
        { title: "Cotizado automáticamente", body: "Cada hallazgo se convierte en un monto desglosado en dólares — sin hoja en blanco a la hora de cotizar." },
        { title: "Tus claves de API, tus datos", body: "Funciona con tus propias cuentas de Anthropic y Google Places. Nada se comparte, nada se revende." },
      ],
    },
    offerTiers: {
      heading: "Cotizado de la forma en que realmente se vende",
      sub: "Sin cotización fija de varios miles de dólares. Ítems desglosados, agrupados en un paquete solo cuando la auditoría indica que deben estarlo.",
      tiers: [
        { name: "Victoria Rápida", price: "US$200", body: "Un ítem — una sola corrección auditada, cotizada y lista para proponerse por sí sola." },
        { name: "Suma y Ahorra", price: "US$200 × N", body: "¿Calificas para más de un servicio? Súmalos — cada uno sigue cotizado de forma independiente." },
        { name: "Consultoría Extra", price: "+US$100", body: "Una consultoría estratégica fija de 1 hora con Hudson, ofrecida en cada lead." },
        { name: "Paquete Completo", price: "El total", body: "Cada ítem calificado más la consultoría extra, sumados automáticamente en la pestaña de Oferta." },
      ],
    },
    faq: {
      heading: "Preguntas frecuentes",
      items: [
        { q: "¿Qué regiones y nichos son compatibles?", a: "Cualquier región que cubra Google Places. Hay un paquete predefinido de 8 nichos (clínicas dentales, bienes raíces, bufetes de abogados, restaurantes, gimnasios, talleres mecánicos, salones de belleza, contratistas generales) — categorías propensas a cadenas, como franquicias hoteleras, quedan deliberadamente excluidas. Los nichos personalizados también funcionan." },
        { q: "¿Contactan a los leads por mí?", a: "No — MoneyMachine encuentra y audita los negocios y redacta la propuesta. El contacto (WhatsApp, llamadas, correo) sigue siendo tuyo, aunque cada lote viene con un puntaje caliente/tibio/frío y una cadencia semanal sugerida." },
        { q: "¿Qué revisa realmente la auditoría?", a: "Fricción de conversión real en el sitio en vivo — fatiga de decisión, falta de captura de leads, ningún camino de seguimiento por correo o redes sociales, materiales poco profesionales — puntuado por línea de servicio, con hallazgos específicos vinculados a la página real, no una lista genérica." },
        { q: "¿Mis datos son privados?", a: "Funciona con tus propias claves de API de Anthropic y Google Places. Nada se comparte entre cuentas ni se revende." },
        { q: "¿Qué claves de LLM/API usa?", a: "Anthropic Claude para auditorías, PRDs y cronogramas de contacto; Google Places para descubrimiento y autocompletado. Trae tus propias claves para ambos." },
      ],
    },
    cta: {
      heading: "Construido por Hudson. Funcionando en vivo ahora mismo.",
      sub: "Mira a MoneyMachine trabajar en una ciudad y nicho reales, de tu elección.",
      bookCall: "Agendar llamada",
      bigLine1: "LA MÁQUINA QUE",
      bigLine2: "ENCUENTRA A TU PRÓXIMO CLIENTE.",
      footer: { howItWorks: "Cómo funciona", pricing: "Precios", faq: "Preguntas", dashboard: "Panel" },
    },
  },
};
