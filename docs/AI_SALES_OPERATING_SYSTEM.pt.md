# Sistema de Vendas com IA da ClubeMKT

## Princípio
A IA cuida da pesquisa, preparação, documentação e acompanhamento repetitivos. As pessoas mantêm o julgamento, a empatia, a apresentação, o tratamento de objeções e o relacionamento.

## Fluxo de cinco fases

1. Prospectar
   - Buscar por perfil de cliente ideal, nicho, região e sinais de compra.
   - Enriquecer os dados da empresa e da pessoa responsável.
   - Remover duplicados antes do contato.
   - Fazer uma validação humana rápida antes de ativar o alcance.

2. Qualificar
   - Perguntar sobre problema, urgência, processo atual, tamanho da equipe, investimento, resultado desejado e autoridade de decisão.
   - Salvar respostas e pontuação no registro do lead.
   - Apenas leads qualificados ou pendentes de revisão avançam para uma reunião.

3. Apresentar
   - Combinar CRM, auditoria do site, respostas de qualificação, transcrição e objeções.
   - Gerar uma proposta e um roteiro personalizados.
   - Agendar uma chamada para revisar a proposta; não depender de enviar um arquivo sem conversa.

4. Tratar objeções
   - Salvar transcrições e revisões de objeções.
   - Gerar perguntas e roteiros para prática.
   - A IA treina; a pessoa responde à objeção real.

5. Inscrever e entregar
   - Marcar a venda com valor e próxima ação.
   - Iniciar o onboarding imediatamente.
   - Criar uma primeira vitória rápida.
   - Registrar a vitória e a autorização para compartilhá-la.

## Novas rotas

- `POST /api/leads/:id/qualification`
- `POST /api/leads/:id/artifacts`
- `PATCH /api/leads/:id/next-action`
- `PATCH /api/leads/:id/onboarding`

Os estados técnicos permanecem em inglês para que as integrações sejam estáveis; os rótulos da interface são traduzidos para espanhol, português e inglês.
