# CS AI Director — primeira entrega: plano de implementação

> **Para execução:** usar desenvolvimento orientado por testes; executar as tarefas na ordem e verificar cada entrega.

**Objetivo:** aplicativo web local em pt-BR que permita escolher um comando, ajustar parâmetros, visualizar movimento 3D, gerar prompt e importar/exportar projeto JSON.

**Arquitetura:** monorepo pnpm/TypeScript. Pacotes de domínio puros para catálogo, geometria, projeto e prompt; React/R3F apenas na aplicação web. Estado de edição com Zustand; arquivo JSON como persistência inicial.

**Stack:** TypeScript, React, Vite, Three.js, React Three Fiber, Zustand, Tailwind CSS, Vitest.

**Especificação:** `docs/especificacao-tecnica.md`; regras: `docs/comandos-e-parametros.md`.

## Restrições globais

- Interface e mensagens em pt-BR. Sem API paga, backend ou alteração no AI Video Studio.
- Catálogo de 20 comandos permanece candidato até conferência das fontes originais.
- Funções de domínio devem ser determinísticas e não importar React ou Three.js.
- Usar o checkout existente da tarefa na nuvem; não criar worktree.

## Revisão de casos críticos

- Dolly que ultrapassa o alvo: validação rejeita.
- Zoom que excede 200 mm: validação rejeita.
- Comandos desconhecidos no JSON: importação preserva e avisa; não executa.
- Dois movimentos da mesma propriedade sobrepostos: conflito explícito.
- WebGL indisponível: controles e prompt permanecem utilizáveis.

## Mapa de arquivos

`package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`: workspace e scripts. `packages/visual-commands/src/index.ts`: catálogo e esquemas. `packages/camera-engine/src/index.ts`: pose e trajetória. `packages/director-core/src/index.ts`: projeto, validação e linha do tempo. `packages/prompt-engine/src/index.ts`: texto. `apps/web/src/{App,main,store,styles}.tsx` (CSS em `styles.css`): UI. `apps/web/src/Scene.tsx`: prévia R3F. `tests/*.test.ts`: comportamento dos pacotes. `apps/playground/`: exemplo de consumo de API. `packages/{platform-adapters,shared-ui}/`: exportador genérico e controles reutilizáveis.

## Tarefa 1 — Workspace e catálogo

**Interface produzida:** `CommandId`, `CommandDefinition`, `getCommand(id)`, `commands`, `validateParams(id, params)`.

- [ ] Criar teste de catálogo que exige 20 IDs únicos, defaults válidos e rejeição de parâmetro fora do intervalo.
- [ ] Rodar teste e confirmar falha por ausência da implementação.
- [ ] Criar configuração pnpm/Vitest/TypeScript e catálogo tipado com as regras da especificação.
- [ ] Rodar teste e typecheck; confirmar sucesso.

## Tarefa 2 — Motor de câmera

**Consome:** `CommandId`, parâmetros validados. **Produz:** `CameraPose`, `applyCommand(start, command, progress)`.

- [ ] Criar testes: `dolly_in` 2 m de 5 m termina a 3 m; `zoom_in` 35 mm × 2 termina em 70 mm com posição fixa; `orbit_left` preserva raio; seek 0 e 1 entrega extremidades.
- [ ] Rodar e confirmar falha.
- [ ] Implementar coordenadas, interpolação e 20 comandos, com recusa de pose inválida.
- [ ] Rodar testes e typecheck; confirmar sucesso.

## Tarefa 3 — Projeto, timeline e prompt

**Consome:** catálogo e motor. **Produz:** `DirectorProjectV1`, `validateProject`, `sampleCamera`, `renderPrompt`, importação/exportação JSON.

- [ ] Criar testes de sequência, conflito, ID desconhecido, round-trip e descrição de movimento em pt-BR.
- [ ] Rodar e confirmar falha.
- [ ] Implementar projeto, validação temporal, composição permitida, preservação de IDs desconhecidos e prompt genérico.
- [ ] Rodar testes e typecheck; confirmar sucesso.

## Tarefa 4 — Aplicativo web e simulador

**Consome:** APIs das tarefas 1–3. **Produz:** interface funcional catálogo→parâmetros→prévia→prompt→arquivo.

- [ ] Criar teste de fluxo com seleção, mudança de parâmetro e atualização de prompt.
- [ ] Rodar e confirmar falha.
- [ ] Implementar layout responsivo em pt-BR, viewport R3F com câmera e trajetória, controles de tempo, editor de parâmetros e fallback textual.
- [ ] Rodar testes, typecheck e build; fazer smoke test no servidor local.

## Tarefa 5 — Integração, documentação e revisão

- [ ] Criar playground que consome API pública e verificar build.
- [ ] Atualizar README e AGENTS.md com comandos reais de desenvolvimento.
- [ ] Executar suíte completa, build e smoke test do fluxo local.
- [ ] Revisar diferenças contra a especificação, registrar limites e pendências das fontes originais.
