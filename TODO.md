# Backlog do Frontend — MeuPetShop

Use este arquivo como a lista técnica principal. Mova apenas as tarefas da semana para o seu quadro Kanban.

Entrega verificada em 07/09/2026: itens implementados ou já existentes confirmados.
Lint e build aprovados; 75 testes passaram em desktop/mobile e um cenário exclusivo
de mobile foi ignorado em desktop. A tabela de clientes e a rota `/login` já estavam
corrigidas na base e receberam cobertura de regressão.

As correções de autorização também foram aplicadas ao backend local e verificadas
em um checkout isolado. Consulte [a revisão e o patch](docs/backend-authorization.md).
Não houve deploy. Decisões e limites de escala estão no [README](README.md).

## Agora — corrigir antes de evoluir

- [x] Corrigir a tabela de clientes: adicionar a coluna **Ações** no cabeçalho e ajustar o `colSpan` do estado vazio para 5.
  - Critério: cabeçalho, registros e mensagem vazia ficam alinhados em desktop e mobile.
- [x] Corrigir o redirecionamento após redefinir senha: trocar `/login` por `/` ou criar explicitamente a rota `/login`.
  - Critério: após redefinir a senha, o usuário chega diretamente à tela de login.
- [x] Fazer o lint passar sem erros.
  - Critério: `npm run lint` termina com código 0.
- [x] Adicionar estados de carregamento, erro e nova tentativa nas listagens de clientes, pets, produtos, serviços, agenda e equipe.
  - Critério: a tela não exibe “Nenhum item cadastrado” enquanto a API ainda está carregando.
- [x] Tratar respostas 401 globalmente.
  - Critério: ao expirar a sessão, o usuário é deslogado e encaminhado ao login com uma mensagem clara.

## Próximo — formulários e validações

- [x] Validar e normalizar o cadastro de clientes.
  - Nome e endereço sem espaços extras; telefone com máscara e formato válido; e-mail validado.
- [x] Validar produtos e serviços antes de enviar à API.
  - Preço, estoque e duração precisam ser números válidos e não negativos.
- [x] Impedir agendamentos em datas passadas.
  - Critério: data/hora mínima é o momento atual e o usuário recebe uma mensagem explicativa.
- [x] Melhorar validação de senha no cadastro e redefinição.
  - Adicionar confirmação de senha, tamanho mínimo e orientação de senha forte.
- [x] Adicionar `autocomplete` nos campos de login e senha.
  - Usar `username`, `current-password` e `new-password` conforme o fluxo.
- [x] Desabilitar ações destrutivas enquanto a solicitação estiver em andamento.
  - Critério: não é possível enviar duas exclusões/cancelamentos pelo mesmo botão.

## UX e visual

- [x] Criar componentes reutilizáveis: `PageCard`, `FormField`, `Button`, `Alert` e `DataTable`.
  - Critério: reduzir estilos inline repetidos nas páginas.
- [x] Substituir seletores CSS baseados em atributos `style` por classes semânticas.
- [x] Criar destaque da rota ativa na sidebar com `NavLink`.
- [x] Melhorar tabelas no celular.
  - Exibir indicação “Deslize para ver mais” ou usar cards por registro em telas pequenas.
- [x] Padronizar tipografia, espaçamentos, cores, ícones e estados de botões.
- [x] Evoluir a home com indicadores reais.
  - Próximos agendamentos, estoque baixo, total de clientes e ações rápidas.

## Acessibilidade

- [x] Ligar todo `label` a um `input` com `htmlFor` e `id`.
- [x] Exibir mensagens de erro/sucesso com `role="alert"` ou `aria-live`.
- [x] Criar estados de foco visíveis para navegação por teclado.
- [x] Melhorar tabelas com `scope="col"` e `caption`.
- [x] Ajustar foco do menu mobile ao abrir e fechar.

## Arquitetura e qualidade

- [x] Centralizar requisições HTTP e tratamento de erros/autorização.
- [x] Revisar armazenamento do token e garantir que o backend valide todas as permissões.
- [x] Adicionar busca, filtros, ordenação e paginação às listagens.
- [x] Criar testes para login, permissões, cadastros, validações e fluxos de exclusão.
- [x] Configurar CI para executar build e lint em cada pull request.

## Ordem sugerida de execução

1. Bugs críticos e lint.
2. Loading, erros e sessão expirada.
3. Validações de formulário.
4. Componentes visuais reutilizáveis.
5. Acessibilidade, filtros e testes.
