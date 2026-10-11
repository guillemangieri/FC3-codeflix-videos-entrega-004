<<<<<<< HEAD
# Montagem do ambiente de desenvolvimento (Docker e IDE)
# Criar uma aplicação TypeScript (Core)
# Criar entidade de Categoria
# Criar testes (pirâmide de testes)
# Criar Casos de Uso e Repositório
# Nest.js - Criação de API Rest
# Criar testes e2e (end-to-end)

# Repetir para as outras entidades Cast member, Genre, Video

# Integração com RabbitMQ e Encoder de vídeo
# Keycloak
# Logs
# CI (Github actions, Dockerfile produção)

# 3 imagens (banner, thumbnail, thumbnail half)

# 2 video (trailer, video)

## DDD

--- entidades ou objetos de negócio

video ou banner - checksum


## imagens

name
location

## audio videos

name
raw_location - novo valor
encoded_location
status = completed

=======
# FC3-codeflix-videos-entrega-001
repositório da primeira entrega de codeflix para o curso de full cycle 3
>>>>>>> aee684aec2e7b1a171875d680643f8f9cae6cfe5

## Autenticação com token JWT manual (D3)

Os endpoints de categorias, gêneros, elenco e vídeos exigem um token JWT.
Categorias também exige o perfil `admin-catalog`. O login demonstrativo
`POST /auth` foi removido; a emissão é feita localmente por script.

### Configuração das chaves

Configure `JWT_PRIVATE_KEY` e `JWT_PUBLIC_KEY` em `envs/.env`, arquivo
ignorado pelo Git. A chave pública deve corresponder à chave privada.
Se precisar criar um novo par, execute localmente:

```bash
node create-rsa.js
```

O script imprime primeiro a chave privada e depois a pública, com quebras
de linha escapadas. Copie cada valor para a variável correspondente no
arquivo de ambiente, usando aspas duplas para que o dotenv interprete `\n`.
Não publique as chaves privadas nem compartilhe a saída do script.
Garanta que a API carregue a chave pública do mesmo par no seu ambiente.

### Geração e uso

Na raiz do projeto, execute:

```bash
node generate-token.js
```

O script lê `envs/.env` e gera um token RS256 com o perfil `admin-catalog`
e validade de 24 horas. Envie-o no cabeçalho de cada requisição:

```http
Authorization: Bearer SEU_TOKEN
```

Com a API iniciada, `GET /auth` permite conferir o token: um token válido
retorna `200`; token ausente, inválido ou expirado retorna `401`.
Após expirar, gere outro token. A expiração é do token, não das chaves.

### Testes de autenticação

```bash
npm run test:e2e -- --runInBand --runTestsByPath test/auth/auth.e2e-spec.ts
```

Essa suíte usa o guard real e chaves temporárias geradas em memória.
Ela não depende de tokens manuais ou de chaves privadas pessoais.
