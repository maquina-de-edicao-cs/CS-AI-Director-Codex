# Roadmap e critérios de aceitação propostos

**Estado:** direção geral aprovada em 25/11/2026; primeira versão local em desenvolvimento. Os comandos seguem candidatos até confronto com as fontes originais. A ordem abaixo separa capacidades já iniciadas da validação restante.

## Sequência de entregas

**Progresso atual:** workspace e catálogo implementados; amostragem de câmera, projeto, prompt genérico, editor web, playground e exportação local têm uma primeira implementação. Restam validação com as fontes originais, revisão visual no navegador com WebGL, testes mais amplos de todos os movimentos e ajustes de acessibilidade/desempenho antes de chamar a primeira versão de concluída.

| Etapa | Entrega verificável | Dependências |
| --- | --- | --- |
| 0. Alinhamento | Aprovar especificação, vocabulário e fontes dos 20 comandos | Registros anteriores ou validação da proposta |
| 1. Contratos e catálogo | Monorepo, tipos, esquema JSON e comandos documentados/validados | Etapa 0 |
| 2. Motor de câmera | Trajetórias e amostragem determinística de cada comando | Etapa 1 |
| 3. Núcleo de direção | Timeline, composição, conflitos, persistência e migração | Etapas 1–2 |
| 4. Prompt engine | Expansão genérica em pt-BR, avisos e testes de exemplos | Etapas 1 e 3 |
| 5. Web e simulador | Interface profissional, viewport 3D, edição e fallback sem WebGL | Etapas 2–4 |
| 6. Playground e exportação | Exemplos de integração, arquivo JSON, texto e copiar | Etapas 3–5 |
| 7. Preparação de distribuição | CI, acessibilidade, desempenho e revisão de publicação | Todas anteriores |

## Aceitação e testes por módulo

| Módulo | Critério de aceitação | Teste obrigatório planejado |
| --- | --- | --- |
| `visual-commands` | 20 comandos aprovados, IDs estáveis, esquemas, descrições pt-BR, defaults e limites explícitos | Testes de catálogo completo, validação de limites, unidades, IDs duplicados e serialização |
| `camera-engine` | Poses inicial/final corretas, seek determinístico, alvo e distância respeitados, sem NaN | Testes numéricos de cada família de comando, extremos, composição permitida e propriedade de seek |
| `director-core` | Projeto v1 validado, timeline determinística, conflitos claros, import/export sem perda silenciosa | Testes de sequência e sobreposição, round-trip JSON, versão desconhecida e comando desconhecido |
| `prompt-engine` | Texto genérico fiel aos parâmetros, ordem temporal e avisos; mesmo input gera mesmo output | Golden tests semânticos em pt-BR, caracteres especiais, omissão de comandos desconhecidos e perfil inválido |
| `platform-adapters` | Formato genérico funcional; perfis futuros isolados e versionados | Testes de contrato de exportação, avisos por capacidade não suportada e independência de rede |
| `shared-ui` | Controles acessíveis, estados de erro e unidades legíveis | Testes de teclado, foco, rótulos, contraste e componentes de entrada |
| `apps/web` | Fluxo completo catálogo→prévia→prompt→arquivo funciona em navegador | Teste E2E do fluxo feliz, arquivo inválido, tela estreita e fallback sem WebGL; inspeção visual do layout |
| `apps/playground` | Demonstra integração pública sem importar detalhes internos | Build e smoke test de um projeto de exemplo |

## Verificações transversais

- TypeScript estrito e build de todos os pacotes e aplicativos.
- Nenhum pacote central importa navegador, React ou código do AI Video Studio.
- Sem chamadas a APIs pagas; testes de rede podem ser bloqueados e o fluxo local deve seguir funcionando.
- Testar projeto com duração longa, valores extremos, entrada malformada, WebGL indisponível e interrupção/retomada da prévia.
- Testar restauração de arquivo com projeto criado em versão anterior quando houver migração.
- Medir desempenho no hardware alvo antes de aprovar metas numéricas; não afirmar metas sem medida.

## GitHub, Vercel e AI Video Studio

**GitHub:** após autorização para implementação, criar CI de lint, tipos, testes e build; revisão de mudanças e versionamento semântico dos contratos. Publicação de pacotes e proteção de branch são decisões posteriores.

**Vercel:** avaliar deploy do aplicativo estático apenas após teste local e aprovação de hospedagem, custos, domínio e política de publicação. Configuração de prévia e produção deve manter segredos fora do navegador. Não há necessidade de Vercel para desenvolver a primeira versão.

**AI Video Studio:** definir em separado versão de pacote e contrato de importação/exportação; testar integração em fixture ou aplicação de exemplo. O repositório existente não será modificado nesta etapa. Qualquer alteração posterior nele requer tarefa e autorização próprias.

## Marcos de revisão

Ao final de cada etapa, demonstrar o comportamento e apresentar evidência dos testes correspondentes. Falhas e limitações devem ser registradas antes de avançar. A etapa 0 é o portão para instalação de dependências e código funcional, conforme pedido do proprietário.
