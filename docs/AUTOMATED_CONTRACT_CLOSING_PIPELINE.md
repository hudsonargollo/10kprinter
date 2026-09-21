# Moneymaker Automated Contract-Closing Pipeline: PRD & Execution Guide

## 1. Introdução e Visão Geral do Produto (Product Overview)

O projeto 10kprinter (MoneyMachine) é um ecossistema de e-commerce e vendas de serviços de alta performance projetado para imprimir receita com intervenção humana mínima. Utilizando arquitetura Cloudflare Workers e orquestração via agentes de IA, o sistema foca em solopreneurs e agências que buscam escala sem os riscos de inventário físico ou gargalos operacionais manuais.

O caso de uso e arquitetura cobrem tanto produtos físicos Print-on-Demand (ex: domínio público / Lulu API) quanto serviços automatizados de web design, automação de processos e fechamento de contratos de alta conversão.

---

## 2. Metodologia de Operação: Estratégia de Agentes Duais

A eficiência do sistema reside na separação clara entre o planejamento estratégico e a execução técnica via terminal.

| Atributo | Claude Co-work (Estratégico) | Claude Code / Hermes (Executivo) |
| :--- | :--- | :--- |
| **Foco** | Inteligência de Mercado e Funil | Implementação e Automação |
| **Ações Críticas** | Pesquisa de concorrentes (Meta Ad Library), Redação de PRDs de criativos e Diagnóstico de CRO. | Instalação de dependências, Deploy via WOP/Wrangler, Webhooks de pagamento e CRM sync. |
| **Papel no Case** | Definiu o posicionamento da oferta ($39.99 / Bundles / Order Bumps). | Construiu a landing page, configurou pipelines de disparos e automação de outreach. |

---

## 3. Modelo de Negócio e Unit Economics

### 3.1 Alocação de Orçamento ($500)
- **Tráfego Pago (Meta):** $50/dia (Foco em conversão imediata).
- **Tráfego Orgânico (X/Twitter / DMs):** $100 (Negociados para 5 reposts em perfis de nicho — custo unitário de $20).
- **Reserva Operacional:** Capital para processamento dos primeiros pedidos (Print-on-Demand / tooling).

### 3.2 Tabela de Custos e Breakeven
| Item | Custo (USD) | Observação |
| :--- | :--- | :--- |
| **Produção (Hardcover)** | $15.00 | Via API Lulu.com |
| **Frete (Shipping)** | $7.00 | Logística direta ao cliente |
| **COGS (Custo de Produto)** | $22.00 | Sem custo de inventário |
| **CAC Estimado (Ads)** | $20.00 | Target para escala |
| **Ponto de Breakeven** | $42.00 | Margem mínima para lucratividade |

### 3.3 Pivot de Preço e Valor Percebido
- **Oferta Otimizada:** $39.99 com Frete Grátis / Lead-in de $150–$250 para serviços, utilizando a estratégia de **Value Stacking** (inclusão de assets digitais, setups automatizados e templates) para eliminar o atrito de confiança e reduzir barreiras de entrada.

---

## 4. Estratégia de Tráfego e Aquisição

1. **Meta Ads (Scalability):** Variações de criativos automatizados com segmentação Tier 1 (EUA, Reino Unido, Canadá, Austrália).
2. **X/Twitter & Direct DM Outreach:**
   - **Volume:** 5 posts/dia, 10 respostas estratégicas em tópicos quentes, 2 quote-tweets.
   - **Bulk Influencer Reposts:** Pacotes de 5 posts por $100 com links diretos de checkout/contrato.
   - **CLI de Automação:** Script `scripts/outreach.py` com delay jitter e proteção contra banimentos de taxa de envio.

---

## 5. Diagnóstico de Funil, CRO e AOV Optimization

- **Preloading de Checkouts:** Eliminação de gargalos de carregamento (>7s) pré-carregando modais e rotas de checkout.
- **Order Bumps:** Ofertas de baixo atrito pós-clique ($15–$50).
- **Bundles Multi-Tier:** Ofertas progressivas baseadas na regra *"quem assina/compra um item, compra o bundle completo"*.

---

## 6. Cold DM Messaging Templates & CLI Integration

A ferramenta de linha de comando `scripts/outreach.py` disponibiliza 3 modelos padrão parametrizáveis:
1. `influencer_repost`: Parcerias e reposts pagos com negociação em lote.
2. `b2b_agency`: Pitch direto de automação de fechamento de contratos para agências.
3. `value_stack_followup`: Follow-up focado em quebra de objeções com bônus gratuitos e order bumps.

### Comandos Rápidos do CLI:
```bash
# Inicializar base de dados
python3 scripts/outreach.py init

# Adicionar lead de alto valor
python3 scripts/outreach.py add-lead --name "Digital Edge Agency" --handle "@digitaledge" --niche "SaaS Marketing" --template b2b_agency --contract-link "https://1kprint.clubemkt.digital/app/"

# Visualizar DMs renderizadas
python3 scripts/outreach.py preview

# Executar disparo em lote com safety delay
python3 scripts/outreach.py send --limit 10 --min-delay 5.0 --max-delay 15.0

# Atualizar status e valor de contrato fechado
python3 scripts/outreach.py update --id L001 --status CONVERTED --value 250.00

# Exibir painel de conversão e métricas
python3 scripts/outreach.py analytics
```
