# Backlog do Frontend — MeuPetShop

Use este arquivo como a lista técnica principal. Mova apenas as tarefas da semana para o seu quadro Kanban.

## Agora — corrigir antes de evoluir

- [ ] Corrigir a tabela de clientes: adicionar a coluna **Ações** no cabeçalho e ajustar o `colSpan` do estado vazio para 5.
  - Critério: cabeçalho, registros e mensagem vazia ficam alinhados em desktop e mobile.
- [ ] Corrigir o redirecionamento após redefinir senha: trocar `/login` por `/` ou criar explicitamente a rota `/login`.
  - Critério: após redefinir a senha, o usuário chega diretamente à tela de login.
- [ ] Fazer o lint passar sem erros.
  - Critério: `npm run lint` termina com código 0.
- [ ] Adicionar estados de carregamento, erro e nova tentativa nas listagens de clientes, pets, produtos, serviços, agenda e equipe.
  - Critério: a tela não exibe “Nenhum item cadastrado” enquanto a API ainda está carregando.
- [ ] Tratar respostas 401 globalmente.
  - Critério: ao expirar a sessão, o usuário é deslogado e encaminhado ao login com uma mensagem clara.

## Próximo — formulários e validações

- [ ] Validar e normalizar o cadastro de clientes.
  - Nome e endereço sem espaços extras; telefone com máscara e formato válido; e-mail validado.
- [ ] Validar produtos e serviços antes de enviar à API.
  - Preço, estoque e duração precisam ser números válidos e não negativos.
- [ ] Impedir agendamentos em datas passadas.
  - Critério: data/hora mínima é o momento atual e o usuário recebe uma mensagem explicativa.
- [ ] Melhorar validação de senha no cadastro e redefinição.
  - Adicionar confirmação de senha, tamanho mínimo e orientação de senha forte.
- [ ] Adicionar `autocomplete` nos campos de login e senha.
  - Usar `username`, `current-password` e `new-password` conforme o fluxo.
- [ ] Desabilitar ações destrutivas enquanto a solicitação estiver em andamento.
  - Critério: não é possível enviar duas exclusões/cancelamentos pelo mesmo botão.

## UX e visual

- [ ] Criar componentes reutilizáveis: `PageCard`, `FormField`, `Button`, `Alert` e `DataTable`.
  - Critério: reduzir estilos inline repetidos nas páginas.
- [ ] Substituir seletores CSS baseados em atributos `style` por classes semânticas.
- [ ] Criar destaque da rota ativa na sidebar com `NavLink`.
- [ ] Melhorar tabelas no celular.
  - Exibir indicação “Deslize para ver mais” ou usar cards por registro em telas pequenas.
- [ ] Padronizar tipografia, espaçamentos, cores, ícones e estados de botões.
- [ ] Evoluir a home com indicadores reais.
  - Próximos agendamentos, estoque baixo, total de clientes e ações rápidas.

## Acessibilidade

- [ ] Ligar todo `label` a um `input` com `htmlFor` e `id`.
- [ ] Exibir mensagens de erro/sucesso com `role="alert"` ou `aria-live`.
- [ ] Criar estados de foco visíveis para navegação por teclado.
- [ ] Melhorar tabelas com `scope="col"` e `caption`.
- [ ] Ajustar foco do menu mobile ao abrir e fechar.

## Arquitetura e qualidade

- [ ] Centralizar requisições HTTP e tratamento de erros/autorização.
- [ ] Revisar armazenamento do token e garantir que o backend valide todas as permissões.
- [ ] Adicionar busca, filtros, ordenação e paginação às listagens.
- [ ] Criar testes para login, permissões, cadastros, validações e fluxos de exclusão.
- [ ] Configurar CI para executar build e lint em cada pull request.

## Ordem sugerida de execução

1. Bugs críticos e lint.
2. Loading, erros e sessão expirada.
3. Validações de formulário.
4. Componentes visuais reutilizáveis.
5. Acessibilidade, filtros e testes.
