# GymMaxxing

Protótipo inicial da plataforma de gestão de academia GymMaxxing.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

## O que já existe

- Tela de login e criação de conta com os perfis Administrador, Membro e Profissional.
- Dashboard com resumo da academia, atividade, próximos horários e ações rápidas.
- Agenda semanal com escalas dos profissionais.
- Lista de usuários com cargos, status e busca.
- Kanban de treinos por dia da semana.
- Catálogo local com 171 exercícios, busca por nome/alias, filtro por grupo muscular e inclusão de movimentos personalizados.
- Montador de refeições com busca no catálogo local de 34 alimentos, filtro por categoria e cálculo automático de calorias, proteína, carboidratos, gorduras, fibras, açúcares e sódio por quantidade.
- Tela de configurações e preferências.

Os catálogos ficam em `src/data/exercises.js` e `src/foodDatabase.js`. Os treinos e refeições ainda ficam em memória no protótipo; a próxima etapa é conectar autenticação, banco de dados e permissões reais.
