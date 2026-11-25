# Instruções para agentes — CS AI Director

## Estado do projeto

O planejamento foi aprovado para iniciar o desenvolvimento. Há uma primeira versão local em andamento. A escolha definitiva dos 20 comandos ainda depende das fontes originais. Leia `README.md` e `docs/especificacao-tecnica.md` antes de propor código.

## Objetivo e limites

- Criar aplicativo web independente em português brasileiro, com núcleo reutilizável pelo AI Video Studio.
- Preservar separação entre lógica pura (`packages/`) e interface (`apps/`). Nenhum pacote central pode importar React, Three.js, Vercel ou código do AI Video Studio.
- Não modificar o repositório do AI Video Studio.
- Não usar APIs pagas, contratar serviços, criar contas, publicar ou implantar sem autorização explícita.
- Tratar nomes e descrições dos 20 comandos como proposta até comparação com as fontes originais. Não apresentar essa proposta como transcrição do Instagram.

## Convenções propostas

- TypeScript estrito; interfaces públicas e esquemas de dados versionados; unidades SI para movimento (metros, segundos, graus apenas na entrada/saída humana; radianos internamente).
- Cálculos de câmera, catálogo de comandos e expansão de prompts devem ser determinísticos e testáveis sem navegador ou rede.
- Interface acessível, responsiva e em pt-BR. Operações importantes precisam ter opção por teclado e feedback textual, além da visualização 3D.
- Alterações no contrato entre pacotes exigem testes de compatibilidade e atualização da documentação.
- Não registrar prompts privados, imagens ou segredos em logs por padrão.

## Fluxo de trabalho

1. Confirmar a versão da especificação e os comandos de referência quando estiverem disponíveis.
2. Implementar em incrementos verificáveis conforme `docs/roadmap.md`, começando por contratos e testes do núcleo.
3. Executar testes unitários, integração e verificações visuais relevantes antes de declarar um módulo pronto.
4. Documentar decisões de arquitetura e alterações de comportamento.

Cada tarefa na nuvem já possui checkout isolado. Use o checkout existente; não crie Git worktree salvo se o usuário pedir.

## Referências

- `docs/especificacao-tecnica.md`: arquitetura, contratos e comportamento.
- `docs/comandos-e-parametros.md`: proposta do catálogo e regras operacionais.
- `docs/roadmap.md`: sequência, aceitação e testes.
