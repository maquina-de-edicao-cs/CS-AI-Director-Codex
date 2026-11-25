# Catálogo proposto de comandos e parâmetros

**Estado:** proposta técnica para discussão, não transcrição dos 20 comandos do Instagram nem das conversas sobre CS Visual Commands v1.0 e CS Camera Director v1.0. Os registros originais não estão disponíveis nesta tarefa. IDs, nomes, limites, exemplos e regras abaixo devem ser validados antes de virar contrato v1.0.

Para cada exemplo original, a revisão deverá registrar link ou captura autorizada, nome usado na fonte, interpretação do movimento, parâmetros observáveis, comando candidato correspondente e diferenças. Sem esse mapeamento, não se deve afirmar cobertura dos 20 exemplos analisados.

## Vocabulário e modelo comum

Um comando descreve uma mudança de câmera entre `startSeconds` e `startSeconds + durationSeconds`. `durationSeconds` padrão: 3 s; intervalo proposto: 0,1–60 s. `easing`: `linear` ou `easeInOut` (padrão). `strength` é usado apenas para comandos sem medida física direta, intervalo 0–1. O parâmetro `target` representa o ponto observado; `subjectId` só é aceito se existir na cena. Um comando sem alvo explícito herda o alvo da câmera no instante inicial.

Parâmetros são validados com erro em pt-BR: valor finito, unidade esperada, intervalo e dependências. Valores fora do intervalo não são silenciosamente ajustados; a interface pode oferecer correção explícita. Cada instância guarda os valores escolhidos, não apenas diferenças em relação ao padrão. A ordem de execução para comandos com mesmo início é `startSeconds`, depois `trackOrder`, depois `id`, para resultados estáveis.

## Convenções espaciais

- Mundo em metros, eixo `+Y` para cima, sistema de mão direita. A frente da câmera aponta para o alvo.
- **Esquerda/direita** são relativas à câmera no instante inicial do comando. **Aproximar/afastar** seguem o vetor câmera→alvo; não são movimento de objeto.
- `angleDegrees` é positivo na direção nomeada pelo comando. Rotação interna em radianos.
- Movimento translacional usa `distanceMeters`; foco usa `distanceMeters` a partir da câmera; zoom usa `factor` da distância focal virtual (sem translação).
- No começo/fim de cada comando, a amostragem entrega exatamente o estado inicial/final validado. Seek direto deve produzir o mesmo quadro que reprodução contínua.

## Os 20 comandos candidatos

Os IDs são estáveis dentro desta **proposta**. Cada par representa direções opostas da mesma operação. Uma implementação pode oferecer tradução e sinônimos sem mudar o ID.

| # | ID | Nome na interface | Operação 3D | Parâmetro principal (padrão; intervalo proposto) |
| --- | --- | --- | --- | --- |
| 1 | `pan_left` | Panorâmica à esquerda | Girar orientação em torno de Y, posição fixa | `angleDegrees` (30°; 1–180°) |
| 2 | `pan_right` | Panorâmica à direita | Girar orientação em torno de Y, posição fixa | `angleDegrees` (30°; 1–180°) |
| 3 | `tilt_up` | Inclinar para cima | Girar orientação no eixo lateral, posição fixa | `angleDegrees` (20°; 1–85°) |
| 4 | `tilt_down` | Inclinar para baixo | Girar orientação no eixo lateral, posição fixa | `angleDegrees` (20°; 1–85°) |
| 5 | `truck_left` | Deslocar à esquerda | Transladar posição e alvo lateralmente | `distanceMeters` (2 m; 0,05–100 m) |
| 6 | `truck_right` | Deslocar à direita | Transladar posição e alvo lateralmente | `distanceMeters` (2 m; 0,05–100 m) |
| 7 | `pedestal_up` | Elevar câmera | Transladar posição e alvo em Y | `distanceMeters` (1 m; 0,05–100 m) |
| 8 | `pedestal_down` | Abaixar câmera | Transladar posição e alvo em Y | `distanceMeters` (1 m; 0,05–100 m) |
| 9 | `dolly_in` | Aproximar câmera | Transladar câmera rumo ao alvo, alvo fixo | `distanceMeters` (2 m; 0,05–100 m) |
| 10 | `dolly_out` | Afastar câmera | Transladar câmera para longe do alvo, alvo fixo | `distanceMeters` (2 m; 0,05–100 m) |
| 11 | `orbit_left` | Orbitar à esquerda | Percorrer arco ao redor do alvo, mantendo olhar | `angleDegrees` (45°; 1–360°) |
| 12 | `orbit_right` | Orbitar à direita | Percorrer arco ao redor do alvo, mantendo olhar | `angleDegrees` (45°; 1–360°) |
| 13 | `crane_up` | Grua ascendente | Arco vertical ao redor do alvo, mantendo olhar | `angleDegrees` (25°; 1–85°) |
| 14 | `crane_down` | Grua descendente | Arco vertical ao redor do alvo, mantendo olhar | `angleDegrees` (25°; 1–85°) |
| 15 | `zoom_in` | Aproximar pelo zoom | Aumentar distância focal virtual, posição fixa | `factor` (1,5×; 1,01–10×) |
| 16 | `zoom_out` | Afastar pelo zoom | Reduzir distância focal virtual, posição fixa | `factor` (1,5×; 1,01–10×) |
| 17 | `roll_left` | Girar quadro à esquerda | Rotação no eixo óptico | `angleDegrees` (15°; 1–180°) |
| 18 | `roll_right` | Girar quadro à direita | Rotação no eixo óptico | `angleDegrees` (15°; 1–180°) |
| 19 | `focus_near` | Puxar foco para perto | Reduzir distância de foco virtual | `distanceMeters` (2 m; 0,1–1000 m) |
| 20 | `focus_far` | Puxar foco para longe | Aumentar distância de foco virtual | `distanceMeters` (10 m; 0,1–1000 m) |

`focus_near` e `focus_far` ajustam um modelo de profundidade de campo da prévia quando disponível; sem esse efeito, a UI exibe o valor e o prompt, sem sugerir que a imagem foi modificada. Se os exemplos originais incluírem comandos sem equivalente nesta tabela, a lista será substituída antes da versão 1.0.

## Parâmetros adicionais e restrições

| Parâmetro | Aplicação | Padrão proposto | Regra |
| --- | --- | --- | --- |
| `durationSeconds` | Todos | 3 | 0,1–60 s |
| `easing` | Todos | `easeInOut` | Somente enum autorizado |
| `target` | Dolly, orbit, crane, pan/tilt opcionais | Alvo inicial | Vetor finito em metros |
| `lockTarget` | Dolly, orbit, crane | `true` | Mantém orientação no alvo ao mover |
| `focalLengthMm` | Estado inicial da câmera | 35 | 12–200 mm, projeção perspectiva |
| `focusDistanceMeters` | Estado inicial da câmera/foco | Distância ao alvo | 0,1–1000 m |
| `apertureFStop` | Simulação opcional de foco | 4 | 1,2–22; não altera trajetória |
| `profileId` | Exportação de prompt | `generic` | Perfil desconhecido gera erro claro |

O zoom modifica `focalLengthMm` por multiplicação/divisão, com limite final de 12–200 mm; combinações que excedam esse intervalo são inválidas. Dolly não atravessa o alvo: a distância final câmera–alvo deve ser pelo menos 0,1 m. Tilt e crane não cruzam a singularidade vertical; a pose final precisa manter uma orientação calculável. Foco próximo precisa ficar a uma distância menor que a inicial; foco distante, maior. Valores finais incompatíveis são rejeitados na validação, inclusive quando parâmetros individuais estão dentro do intervalo.

## Composição na linha do tempo

1. Comandos sequenciais usam o estado final do segmento anterior como estado inicial do próximo.
2. Sobreposição de comandos da **mesma propriedade** (por exemplo, dois pan simultâneos ou dois zoom) é inválida na primeira versão, com mensagem de conflito e intervalos destacados.
3. Sobreposição de propriedades diferentes é permitida quando a composição é definida: translação, orientação, projeção e foco, nessa ordem. Dois movimentos espaciais simultâneos que alterem o mesmo vetor de posição, mesmo com nomes distintos, exigem validação específica; por padrão são rejeitados.
4. A duração da linha do tempo é o maior instante final habilitado. Comandos desabilitados não afetam prévia nem prompt.
5. Alterar a ordem da linha do tempo ou o alvo recalcula amostras e prompt com a mesma versão do catálogo.
6. Ao importar projeto, IDs desconhecidos permanecem no arquivo com aviso, mas não são executados; exportação de prompt deve identificar a omissão. Não apagar dados silenciosamente.

## Expansão de prompt e adaptação

Para cada instância habilitada, gerar uma frase com operação, direção, medida, duração e relação com o alvo, por exemplo: “A câmera orbita 45° à esquerda do objeto durante 3 segundos, mantendo o enquadramento no alvo.” O texto completo preserva a ordem temporal, identifica sobreposições válidas e acrescenta o contexto de cena fornecido pelo usuário. O modo genérico inclui termos cinematográficos e uma descrição explícita, para evitar depender de sintaxe específica de geradores.

Um perfil de plataforma pode renomear, combinar ou omitir conceitos somente com regra documentada e teste de exemplo. Deve devolver `warnings[]` quando a semântica não puder ser expressa. A adaptação não promete controle físico em modelos de vídeo; o prompt representa intenção. A tradução para outros idiomas, se adicionada, é transformação versionada da representação semântica, não tradução livre do texto final.

## Exemplos de aceitação

- `dolly_in` de 2 m a 5 m do alvo termina a 3 m, preserva alvo e produz descrição de aproximação; 6 m nesse estado é inválido.
- `zoom_in` de 35 mm por fator 2 termina em 70 mm, sem alterar a posição.
- `orbit_left` de 90° mantém distância ao alvo dentro da tolerância numérica definida pelos testes.
- Pan e tilt no mesmo intervalo produzem uma pose reprodutível; dois pan sobrepostos mostram conflito.
- Projeto com ID de comando desconhecido reabre com aviso, preserva os dados e não o executa.
