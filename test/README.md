# Testes de API (E2E)

Execute na raiz do projeto, com as dependências instaladas.

Todos os testes HTTP (categories, cast-members e genres):

```bash
npm run test:e2e -- --runInBand
```

Somente cast-members e genres:

```bash
npm run test:e2e -- --runInBand test/cast-members test/genres
```

Somente criação de cast-member:

```bash
npm run test:e2e -- --runInBand --runTestsByPath test/cast-members/create-cast-member.e2e-spec.ts
```

Verificação de tipos:

```bash
npm run tsc:check
```

## Como funciona

O helper `src/nest-modules/shared-module/testing/helpers.ts` monta o AppModule,
substitui a conexão por SQLite em memória e prepara tabelas novas para cada teste.
Ele aplica os mesmos pipes, filtros e interceptadores globais da aplicação.
O Supertest envia requisições HTTP à aplicação criada pelo teste; não é necessário
executar `npm run start:dev` nem iniciar MySQL para essas suítes.
Ao terminar cada teste, o helper fecha a aplicação e sua conexão.

A configuração Nest ainda é carregada e validada pelo ConfigModule; o helper
substitui a conexão, independentemente do banco indicado em `.env.e2e`.
As verificações aqui cobrem HTTP e persistência SQLite, não particularidades do MySQL.

`npm test -- --runInBand` usa a configuração dos testes em `src`; os arquivos
em `test` utilizam o comando separado `test:e2e`.

## Ajustes de compatibilidade

- Os imports de cast-members usam a pasta local `cast-member-module` e o arquivo
  `cast-member.controller.ts`.
- Os fixtures de cast-members foram trazidos da referência Full Cycle:
  https://github.com/devfullcycle/FC3-admin-catalogo-de-videos-typescript/blob/main/src/nest-modules/cast-members-module/testing/cast-member-fixtures.ts
- CreateCastMemberInput aceita construção sem argumentos para que o Nest preencha
  e valide o DTO a partir do corpo HTTP.
- SearchCastMemberDto transforma o filtro `type` da query string em número antes
  de entregá-lo ao caso de uso.
- A listagem executa todos os cenários do fixture, incluindo filtro por tipo.
