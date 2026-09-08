# MeuPetShop — frontend

Aplicação interna em React e Vite para clientes, pets, produtos, serviços, agenda e
equipe. O [TODO.md](TODO.md) registra o backlog implementado nesta entrega.

## Executar

Use Node.js 22.12+ (a CI utiliza Node 22).

```sh
npm ci
npm run dev
```

Configure `VITE_API_URL` em `.env.local` para apontar para seu backend. Sem essa
variável, o aplicativo utiliza a API de produção já configurada no projeto.
Não inclua tokens ou senhas no arquivo de configuração do frontend.

```dotenv
VITE_API_URL=http://localhost:5000
```

## Verificação

```sh
npm run lint
npm run build
npx playwright install chromium
npm test
```

Os testes iniciam um servidor local na porta 4173 e interceptam as requisições de
API. Não precisam de credenciais ou banco e não escrevem em produção. Cobrem
desktop e celular: autenticação, permissões de interface, sessão expirada,
cadastros, edição, validações, exclusões/cancelamentos, filtros, paginação,
indicadores e navegação por teclado. `npm run test:ui` abre o executor interativo.
Capturas e traces ficam em `test-results/`, ignorado pelo Git.

A CI em `.github/workflows/ci.yml` executa instalação, lint, build e testes em cada
pull request e push na main. Resultado local: 75 testes aprovados e um teste
exclusivo de mobile ignorado no projeto desktop. Lint e build passaram; a auditoria
npm terminou sem vulnerabilidades após atualização compatível das dependências.

## Decisões de implementação

- HTTP centralizado em `apiFetch`, incluindo Bearer, 401, 403, falhas de rede e
  erros da API. Fluxos públicos de login e recuperação não enviam token nem tratam
  credenciais inválidas como sessão expirada.
- `useCollection` distingue carregamento, falha e lista vazia, oferece nova
  tentativa e cancela respostas obsoletas ao sair da tela ou recarregar.
- `DataTable` compartilha busca sem distinção de acentos, filtros, ordenação,
  paginação, legendas e rolagem acessível. A API existente não oferece um contrato
  comum de busca/ordenação: o cliente percorre todas as páginas da API antes de
  filtrar localmente, inclusive para opções dos formulários. Isso corrige a perda
  dos registros além da primeira página. Para bases grandes, a evolução indicada
  é implementar filtros/ordenação no servidor e endpoints de resumo do dashboard.
- Estoque baixo significa até 5 unidades. A home usa dados da API, considera a
  data local para os atendimentos do dia e exclui cancelados dos indicadores.
- Clientes têm nome/endereço normalizados, e-mail validado e telefone nacional
  com DDD (10 ou 11 dígitos), enviado sem máscara.
- Valores numéricos exigem números finitos não negativos; estoque e duração
  exigem inteiros. Senhas de cadastro/redefinição exigem confirmação e 8 caracteres.
- Novos agendamentos e alterações da data exigem horário futuro. A edição de
  status/observações pode preservar a data original de um atendimento passado,
  inclusive seus segundos, sem reagendá-lo.
- Sessões usam `sessionStorage`. Sessões antigas em `localStorage` são removidas;
  os usuários precisam entrar novamente. Logout preserva outras preferências.
- O menu mobile oculta os links fechados da navegação por teclado, mantém o foco
  dentro do menu aberto e o devolve ao botão após fechar. Inputs têm labels
  associados; mensagens são anunciadas e botões têm foco visível.

## Backend

Foram encontradas e corrigidas lacunas de autenticação em produtos/agenda e de
atribuição de perfis no cadastro. As alterações também foram aplicadas ao backend
local. O patch, os testes e as instruções estão em
[docs/backend-authorization.md](docs/backend-authorization.md).

As verificações locais não atestam a configuração do servidor publicado. Não foi
realizado deploy. Publique as correções do backend junto com esta versão do frontend.
