import { test, expect } from '@playwright/test';

const client = {
  id: 1,
  name: 'Ana Silva',
  phone: '11999991234',
  email: 'ana@exemplo.com',
  address: 'Rua A',
};
const product = { id: 1, name: 'Ração', description: 'Para cães', price: 50, stockQuantity: 3 };
const service = { id: 1, name: 'Banho', description: 'Completo', price: 40, durationInMinutes: 30 };
const pet = { id: 1, name: 'Rex', specie: 'Cão', breed: 'SRD', clientId: 1 };
const appointment = {
  id: 1,
  client,
  pet,
  service,
  status: 0,
  appointmentDateTime: '2099-12-20T15:00:00Z',
  notes: '',
};
const user = {
  id: 'u1',
  fullName: 'João',
  username: 'joao',
  email: 'joao@exemplo.com',
  role: 'Funcionario',
};

async function session(page, role = 'SuperAdmin') {
  await page.addInitScript((role) => {
    if (!sessionStorage.getItem('test-initialized')) {
      sessionStorage.setItem('petshop_token', 'test-token');
      sessionStorage.setItem('petshop_role', role);
      sessionStorage.setItem('test-initialized', 'true');
    }
  }, role);
}

async function mockApi(page, override) {
  await page.route('**/api/**', async (route) => {
    if (override && (await override(route))) return;
    const path = new URL(route.request().url()).pathname.toLowerCase();
    const rows = {
      '/api/clients': [client],
      '/api/products': [product],
      '/api/services': [service],
      '/api/pets': [pet],
      '/api/appointments': [appointment],
      '/api/auth': [user],
    };
    await route.fulfill({
      json:
        route.request().method() === 'GET'
          ? { data: rows[path] ?? [], pagination: { totalPages: 1 } }
          : {},
    });
  });
}

test('login, armazenamento de sessão e logout preservam outras preferências', async ({
  page,
  isMobile,
}) => {
  await mockApi(page, async (route) => {
    if (route.request().url().includes('/Auth/login')) {
      expect(route.request().postDataJSON()).toEqual({ username: 'ana', password: 'senha-segura' });
      expect(route.request().headers().authorization).toBeUndefined();
      await route.fulfill({ json: { token: 'test-token', role: 'Admin' } });
      return true;
    }
  });
  await page.goto('/login');
  await page.evaluate(() => {
    localStorage.setItem('tema', 'claro');
    localStorage.setItem('petshop_token', 'legacy');
  });
  await page.getByLabel('Usuário (Username):').fill('ana');
  await page.getByLabel('Senha:', { exact: true }).fill('senha-segura');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  expect(await page.evaluate(() => localStorage.getItem('petshop_token'))).toBeNull();
  expect(await page.evaluate(() => sessionStorage.getItem('petshop_token'))).toBe('test-token');
  if (isMobile) await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
  await page.getByRole('button', { name: 'Sair do sistema' }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => sessionStorage.getItem('petshop_token'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('tema'))).toBe('claro');
});

test('401 no login exibe erro de credenciais sem tratar como sessão expirada', async ({ page }) => {
  await mockApi(page, async (route) => {
    await route.fulfill({ status: 401, json: { message: 'Usuário ou senha inválidos.' } });
    return true;
  });
  await page.goto('/login');
  await page.getByLabel('Usuário (Username):').fill('ana');
  await page.getByLabel('Senha:', { exact: true }).fill('errada');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Usuário ou senha inválidos');
  await expect(page).toHaveURL(/\/login$/);
});

test('401 protegido encerra sessão e explica o motivo', async ({ page }) => {
  await session(page);
  await mockApi(page, async (route) => {
    await route.fulfill({ status: 401, json: {} });
    return true;
  });
  await page.goto('/clientes');
  await expect(page).toHaveURL(/reason=session-expired/);
  await expect(page.getByRole('alert')).toContainText('Sua sessão expirou');
  expect(await page.evaluate(() => sessionStorage.getItem('petshop_token'))).toBeNull();
});

test('rotas e ações respeitam perfil do funcionário', async ({ page, isMobile }) => {
  await session(page, 'Funcionario');
  await mockApi(page);
  for (const path of ['/register', '/usuarios']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/home$/);
  }
  await page.goto('/produtos');
  await expect(page.getByRole('cell', { name: 'Ração', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Excluir', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Editar', exact: true })).toHaveCount(0);
  if (isMobile) await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
  await expect(page.getByRole('link', { name: 'Gerenciar equipe' })).toHaveCount(0);
});

const lists = [
  ['clientes', 'Clients'],
  ['pets', 'Pets'],
  ['produtos', 'Products'],
  ['servicos', 'Services'],
  ['agendamentos', 'appointments'],
  ['usuarios', 'Auth'],
];
for (const [path, endpoint] of lists) {
  test(`${path}: carregamento, erro e nova tentativa`, async ({ page }) => {
    await session(page);
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    let failed = true;
    await mockApi(page, async (route) => {
      if (
        new URL(route.request().url()).pathname.toLowerCase() === `/api/${endpoint.toLowerCase()}`
      ) {
        await gate;
        if (failed) {
          await route.fulfill({ status: 500, json: { message: 'Falha temporária' } });
          return true;
        }
      }
    });
    await page.goto(`/${path}`);
    await expect(page.getByText('Carregando registros...').first()).toBeVisible();
    await expect(page.getByText('Nenhum item cadastrado.')).toHaveCount(0);
    release();
    await expect(page.getByRole('alert').first()).toContainText('Falha temporária');
    failed = false;
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByRole('table')).toBeVisible();
  });
}

test('tabela carrega todas as páginas, busca, filtra e ordena', async ({ page }) => {
  await session(page);
  await mockApi(page, async (route) => {
    if (route.request().url().includes('/Clients')) {
      const second = new URL(route.request().url()).searchParams.get('pageNumber') === '2';
      await route.fulfill({
        json: {
          data: second
            ? [{ ...client, id: 21, name: 'Zélia', address: 'Rua Z' }]
            : Array.from({ length: 20 }, (_, i) => ({
                ...client,
                id: i + 1,
                name: `Cliente ${i + 1}`,
              })),
          pagination: { totalPages: 2 },
        },
      });
      return true;
    }
  });
  await page.goto('/clientes');
  await expect(page.getByRole('status')).toContainText('21 registros');
  await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Página 2');
  await page.getByLabel('Buscar em Clientes cadastrados').fill('zelia');
  await expect(page.getByRole('cell', { name: 'Zélia', exact: true })).toBeVisible();
  await page.getByLabel('Buscar em Clientes cadastrados').fill('');
  await page.getByLabel('Endereço', { exact: true }).selectOption('Rua Z');
  await expect(page.getByRole('status')).toContainText('1 registros');
  await page.getByLabel('Endereço', { exact: true }).selectOption('');
  await page.getByRole('button', { name: 'Nome ↑', exact: true }).click();
  await expect(page.locator('tbody tr').first()).toContainText('Zélia');
});

test('cadastro de cliente normaliza dados; telefone incompleto não é enviado', async ({ page }) => {
  await session(page);
  let body;
  await mockApi(page, async (route) => {
    if (route.request().method() === 'POST') {
      body = route.request().postDataJSON();
      await route.fulfill({ json: {} });
      return true;
    }
  });
  await page.goto('/clientes');
  await page.getByLabel('Nome Completo:').fill('  Maria   Silva ');
  await page.getByLabel('Telefone:').fill('11999');
  await page.getByLabel('E-mail:', { exact: true }).fill('MARIA@EXEMPLO.COM');
  await page.getByLabel('Endereço:', { exact: true }).fill(' Rua   B ');
  await page.getByRole('button', { name: 'Adicionar Cliente' }).click();
  await expect(page.getByRole('alert')).toContainText('telefone válido');
  expect(body).toBeUndefined();
  await page.getByLabel('Telefone:').fill('11999991234');
  await page.getByRole('button', { name: 'Adicionar Cliente' }).click();
  await expect(page.getByText('Cliente cadastrado com sucesso!')).toBeVisible();
  expect(body).toEqual({
    name: 'Maria Silva',
    phone: '11999991234',
    email: 'maria@exemplo.com',
    address: 'Rua B',
  });
});

for (const [path, label, amount, button] of [
  ['produtos', 'Estoque:', 'stockQuantity', 'Adicionar Produto'],
  ['servicos', 'Duração (minutos):', 'durationInMinutes', 'Adicionar Serviço'],
]) {
  test(`${path}: cadastra números válidos e edita`, async ({ page }) => {
    await session(page);
    let sent;
    await mockApi(page, async (route) => {
      if (['POST', 'PUT'].includes(route.request().method())) {
        sent = { method: route.request().method(), body: route.request().postDataJSON() };
        await route.fulfill({ json: {} });
        return true;
      }
    });
    await page.goto(`/${path}`);
    await page.getByLabel('Nome:', { exact: true }).fill('  Novo item  ');
    await page.getByLabel('Preço (R$):').fill('12.50');
    await page.getByLabel(label, { exact: true }).fill('3');
    await page.getByRole('button', { name: button }).click();
    await expect(page.getByText(/cadastrado com sucesso/)).toBeVisible();
    expect(sent.body).toMatchObject({ name: 'Novo item', price: 12.5, [amount]: 3 });
    await page.getByRole('button', { name: 'Editar', exact: true }).click();
    await page.getByLabel('Preço (R$):').fill('25');
    await page.getByRole('button', { name: 'Salvar Alterações' }).click();
    await expect(page.getByText(/atualizado com sucesso/)).toBeVisible();
    expect(sent.method).toBe('PUT');
    expect(sent.body.price).toBe(25);
  });
}

test('cadastro de pet mantém vínculo do cliente', async ({ page }) => {
  await session(page);
  let sent;
  await mockApi(page, async (route) => {
    if (route.request().method() === 'POST') {
      sent = { url: route.request().url(), body: route.request().postDataJSON() };
      await route.fulfill({ json: {} });
      return true;
    }
  });
  await page.goto('/pets');
  await page.getByLabel('Dono do Pet:').selectOption('1');
  await page.getByLabel('Nome do Pet:').fill('  Nina ');
  await page.getByLabel('Espécie (Ex: Cão, Gato):').fill('Gato');
  await page.getByLabel('Raça:').fill('SRD');
  await page.getByRole('button', { name: 'Adicionar Pet' }).click();
  await expect(page.getByText('Pet cadastrado com sucesso!')).toBeVisible();
  expect(sent.url).toContain('/api/clients/1/pets');
  expect(sent.body.name).toBe('Nina');
});

test('agenda bloqueia passado e envia data futura e vínculos', async ({ page }) => {
  await session(page);
  let sent;
  await mockApi(page, async (route) => {
    if (route.request().method() === 'POST') {
      sent = route.request().postDataJSON();
      await route.fulfill({ json: {} });
      return true;
    }
  });
  await page.goto('/agendamentos');
  await page.getByLabel('Cliente:', { exact: true }).selectOption('1');
  await page.getByLabel('Pet:', { exact: true }).selectOption('1');
  await page.getByLabel('Serviço:', { exact: true }).selectOption('1');
  await page.getByLabel('Data e Hora:').fill('2000-01-01T10:00');
  // Bypass native constraints to exercise the submit-time guard too.
  await page.locator('form').evaluate((form) => {
    form.noValidate = true;
  });
  await page.getByRole('button', { name: 'Agendar', exact: false }).click();
  await expect(page.getByRole('alert')).toContainText('futuras');
  expect(sent).toBeUndefined();
  await page.getByLabel('Data e Hora:').fill('2099-12-20T10:00');
  await page.getByRole('button', { name: 'Agendar', exact: false }).click();
  await expect(page.getByText('Agendamento criado com sucesso!')).toBeVisible();
  expect(sent).toMatchObject({ clientId: 1, petId: 1, serviceId: 1 });
  expect(sent.appointmentDateTime).toMatch(/Z$/);
});

for (const [path, endpoint] of lists) {
  test(`${path}: confirma e bloqueia ação destrutiva duplicada`, async ({ page }) => {
    await session(page);
    let calls = 0;
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    await mockApi(page, async (route) => {
      if (route.request().method() === 'DELETE' || route.request().url().includes('/cancel')) {
        calls++;
        await gate;
        await route.fulfill({ status: 403, json: {} });
        return true;
      }
    });
    await page.goto(`/${path}`);
    page.on('dialog', (dialog) => dialog.accept());
    const action = page.getByRole('button', {
      name: path === 'agendamentos' ? 'Cancelar' : 'Excluir',
      exact: true,
    });
    await action.click();
    await expect(page.getByRole('button', { name: 'Aguarde...' })).toBeDisabled();
    expect(calls).toBe(1);
    release();
    await expect(page.getByRole('alert')).toContainText('não tem permissão');
    await expect(action).toBeEnabled();
    expect(endpoint).toBeTruthy();
  });
}

test('cadastro de colaborador exige confirmação de senha', async ({ page }) => {
  await session(page);
  let sent;
  await mockApi(page, async (route) => {
    if (route.request().method() === 'POST') {
      sent = route.request().postDataJSON();
      await route.fulfill({ json: {} });
      return true;
    }
  });
  await page.goto('/register');
  await page.getByLabel('Nome Completo:').fill('João Silva');
  await page.getByLabel('Nome de Usuário:').fill('joao');
  await page.getByLabel('E-mail corporativo:').fill('joao@exemplo.com');
  await page.getByLabel('Senha Provisória:').fill('Senha longa!');
  await page.getByLabel('Confirmar senha:').fill('Outra senha!');
  await page.getByRole('button', { name: 'Confirmar Cadastro' }).click();
  await expect(page.getByRole('alert')).toContainText('não coincidem');
  expect(sent).toBeUndefined();
  await page.getByLabel('Confirmar senha:').fill('Senha longa!');
  await page.getByRole('button', { name: 'Confirmar Cadastro' }).click();
  await expect(page.getByText('Novo usuário cadastrado com sucesso!')).toBeVisible();
  expect(sent.role).toBe('Funcionario');
});

test('redefinição envia token e retorna diretamente ao login', async ({ page }) => {
  let sent;
  await mockApi(page, async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ json: {} });
    return true;
  });
  await page.goto('/reset-password?token=a%2Bb&email=ana%40exemplo.com');
  await page.getByLabel('Nova Senha:', { exact: true }).fill('Senha nova!');
  await page.getByLabel('Confirmar Nova Senha:').fill('Senha nova!');
  await page.getByRole('button', { name: 'Salvar Nova Senha' }).click();
  await expect(page).toHaveURL(/login\?reason=password-reset/);
  await expect(page.getByRole('status')).toContainText('Senha redefinida');
  expect(sent).toEqual({ email: 'ana@exemplo.com', token: 'a+b', newPassword: 'Senha nova!' });
});

test('home usa indicadores reais e links rápidos', async ({ page }) => {
  await session(page);
  await mockApi(page);
  await page.goto('/home');
  await expect(page.locator('.stat-card strong')).toHaveText(['0', '1', '1', '1']);
  await expect(page.getByText('Ração:')).toContainText('3 unidades');
  await expect(page.getByRole('link', { name: 'Novo agendamento' })).toHaveAttribute(
    'href',
    '/agendamentos?new=1',
  );
});

test('menu mobile controla foco e tabela não estoura viewport', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Navegação do drawer mobile');
  await session(page);
  await mockApi(page);
  await page.goto('/clientes');
  const toggle = page.getByRole('button', { name: 'Abrir menu de navegação' });
  await toggle.click();
  await expect(page.getByRole('button', { name: 'Fechar menu', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Sair do sistema' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Fechar menu', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(page.getByText('Deslize para ver mais →')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

for (const [path] of lists) {
  test(`${path}: desistência não envia; confirmação atualiza a listagem`, async ({ page }) => {
    await session(page);
    let changed = false;
    let mutations = 0;
    await mockApi(page, async (route) => {
      if (route.request().method() === 'DELETE' || route.request().url().includes('/cancel')) {
        changed = true;
        mutations++;
        await route.fulfill({ status: 204 });
        return true;
      }
      if (changed) {
        await route.fulfill({
          json: { data: path === 'agendamentos' ? [{ ...appointment, status: 2 }] : [] },
        });
        return true;
      }
    });
    await page.goto(`/${path}`);
    const action = page.getByRole('button', {
      name: path === 'agendamentos' ? 'Cancelar' : 'Excluir',
      exact: true,
    });
    page.once('dialog', (dialog) => dialog.dismiss());
    await action.click();
    expect(mutations).toBe(0);
    page.once('dialog', (dialog) => dialog.accept());
    await action.click();
    await expect(page.getByText(/com sucesso!/)).toBeVisible();
    await expect(action).toHaveCount(0);
    expect(mutations).toBe(1);
    if (path === 'agendamentos')
      await expect(page.getByRole('cell', { name: 'Cancelado', exact: true })).toBeVisible();
    else await expect(page.getByRole('cell', { name: 'Nenhum item cadastrado.' })).toBeVisible();
  });
}

test('agenda permite concluir atendimento passado sem alterar a data original', async ({
  page,
}) => {
  await session(page);
  let sent;
  const original = '2020-01-01T15:00:45Z';
  await mockApi(page, async (route) => {
    if (route.request().method() === 'PUT') {
      sent = route.request().postDataJSON();
      await route.fulfill({ json: {} });
      return true;
    }
    if (new URL(route.request().url()).pathname === '/api/appointments') {
      await route.fulfill({ json: { data: [{ ...appointment, appointmentDateTime: original }] } });
      return true;
    }
  });
  await page.goto('/agendamentos');
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByLabel('Status:', { exact: true }).selectOption('1');
  await page.getByRole('button', { name: 'Salvar Alterações' }).click();
  await expect(page.getByText('Agendamento atualizado com sucesso!')).toBeVisible();
  expect(sent).toMatchObject({ status: 1, appointmentDateTime: original });
});

test('falha de rede e resposta inválida mantêm erro visível e permitem recuperar', async ({
  page,
}) => {
  await session(page);
  let mode = 'network';
  await mockApi(page, async (route) => {
    if (mode === 'network') {
      await route.abort();
      return true;
    }
    if (mode === 'invalid') {
      await route.fulfill({ json: null });
      return true;
    }
  });
  await page.goto('/clientes');
  await expect(page.getByRole('alert')).toContainText('conectar ao servidor');
  mode = 'invalid';
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('alert')).toContainText('lista inválida');
  mode = 'ok';
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('cell', { name: 'Ana Silva' })).toBeVisible();
});

test('campos têm labels, cabeçalhos têm scope e layout cabe na tela', async ({
  page,
}, testInfo) => {
  await session(page);
  await mockApi(page);
  for (const path of [
    '/clientes',
    '/pets',
    '/produtos',
    '/servicos',
    '/agendamentos',
    '/register',
    '/login',
    '/forgot-password',
    '/reset-password?token=a&email=a%40b.com',
  ]) {
    await page.goto(path);
    expect(
      await page
        .locator('input, select, textarea')
        .evaluateAll((inputs) => inputs.every((input) => input.id && input.labels?.length > 0)),
    ).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  await page.goto('/clientes');
  await expect(page.getByRole('table')).toBeVisible();
  expect(
    await page.locator('th').evaluateAll((cells) => cells.every((cell) => cell.scope === 'col')),
  ).toBe(true);
  await expect(page.locator('caption')).toHaveText('Clientes cadastrados');
  await page.screenshot({ path: testInfo.outputPath('clientes.png'), fullPage: true });
  await page.goto('/home');
  await expect(page.locator('.stat-card strong')).toHaveText(['0', '1', '1', '1']);
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
});
