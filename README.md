# CS AI Director

Aplicativo web em português brasileiro para dirigir movimentos de câmera cinematográficos, visualizar uma cena 3D e produzir instruções de prompt reutilizáveis. O núcleo é separado da interface e foi organizado para uma futura integração com o AI Video Studio.

**Estado:** primeira versão local em desenvolvimento. Há um fluxo funcional de catálogo, parâmetros, timeline sequencial, prévia 3D, prompt genérico e importação/exportação JSON. O catálogo de 20 comandos ainda é candidato até comparação com os exemplos originais. Não há serviço publicado.

## Executar localmente

Requer Node.js 24 e pnpm 11. A partir da raiz do repositório:

```bash
pnpm install --frozen-lockfile
pnpm dev --port 4173
```

Abrir o endereço local informado pelo Vite. Em um ambiente de nuvem com diretório pessoal somente para leitura, usar `XDG_DATA_HOME=/workspace/.cache pnpm install --store-dir /workspace/.pnpm-store --frozen-lockfile`.

Verificações:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm build:playground
```

## Preparação para Vercel

O arquivo `vercel.json` define instalação com lockfile, build do aplicativo web e saída estática em `dist`. O projeto da Vercel deve usar a raiz deste repositório como **Root Directory**. Esta configuração não cria um projeto Vercel nem publica o app; confirme equipe, projeto, domínio e ambiente de destino antes de fazer deploy. O playground não faz parte da publicação web.

## Visão da primeira versão

O usuário escolhe um comando visual, ajusta parâmetros de câmera, vê o movimento numa cena 3D interativa, inspeciona uma linha do tempo e obtém um prompt expandido. Pode copiar o resultado e salvar/carregar um projeto local. O produto deve funcionar sem conta, backend ou API paga na primeira entrega.

## Estrutura planejada

```text
apps/
  web/                    Interface principal
  playground/             Exemplos e laboratório de integração
packages/
  director-core/          Contratos, projeto e orquestração
  camera-engine/          Geometria e amostragem de trajetórias
  visual-commands/        Catálogo e validação dos comandos
  prompt-engine/          Expansão e adaptação determinística
  platform-adapters/      Exportadores e integrações opcionais
  shared-ui/              Componentes de interface reutilizáveis
tests/                    Testes entre módulos e cenários completos
docs/                     Especificação, comandos e roadmap
```

Os pacotes existem como workspaces privados com exportação de código TypeScript para uso local. Publicação e compatibilidade externa ainda não foram validadas. A arquitetura e as decisões pendentes estão em [docs/especificacao-tecnica.md](docs/especificacao-tecnica.md). O catálogo proposto está em [docs/comandos-e-parametros.md](docs/comandos-e-parametros.md), e as etapas de entrega em [docs/roadmap.md](docs/roadmap.md).

## Restrições atuais

- Sem deploy ou contratação de serviços sem autorização.
- Sem alterações no AI Video Studio existente.
- Sem APIs pagas ou contratação de serviços sem autorização.
- A lista dos 20 comandos analisados no Instagram e os acordos anteriores sobre CS Visual Commands v1.0 e CS Camera Director v1.0 ainda precisam ser confrontados com os registros originais. Os documentos marcam explicitamente as propostas feitas na ausência dessas fontes.
