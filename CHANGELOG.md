# Changelog

## v0.1.5, 2026-11-22

- O atalho do trilho (Início e o par ao lado) vira uma forma só: o quadrado do ícone encosta na borda esquerda do
  contorno, com a altura da linha e o mesmo raio do canto, sem o vão que separava o quadrado do contorno. Aceso, ele é
  a ponta cheia do contorno, como um segmento de pílula. No trilho estreito o quadrado continua sozinho, redondo e com
  borda; ao alargar, o lado direito dele abre para dentro do cartão no relógio do trilho (`nav-rail-tile` em
  `motion.css`). O ícone fica na mesma coluna dos itens de baixo e não muda de lugar ao acender nem ao alargar (T-452
  do CMMS)
- O item aceso da lista ganha a mesma forma: contorno na cor da marca em volta da linha e o quadrado do ícone como a
  ponta cheia. O item apagado continua só com o quadrado cinza de 32px, que agora mora numa caixa de 36px rente à
  linha com borda clara de 2px: ao acender a borda pega a cor e o quadrado cresce até o contorno sem sair do lugar. No
  trilho estreito o item aceso segue o quadrado redondo de sempre. A linha começa 6px mais à direita (onde começa o
  quadrado), então o fundo do hover também

## v0.1.4, 2026-11-20

- `Button` `outline` passa a ser neutro: borda de campo, fundo do cartão, texto normal e o fundo `muted` no hover e no
  foco. O azul da marca fica só no `default`, a ação principal da tela, e a tela com uma fileira de botões azuis volta a
  ter um destaque só (hierarquia de botões, T-424 do CMMS)

## v0.1.3, 2026-11-18

- Grupo recolhido no `NavList` continua recolhido no trilho estreito: some a lista dele e fica só um traço curto no lugar
  da divisória (meia largura). O título desse grupo sai do `inert` no trilho estreito, então o teclado e o toque chegam nele para abrir
  de novo, com o nome na dica e o traço na cor da marca no foco. Grupo aberto segue igual. `groupFold` em `lib/nav.ts`
  decide as duas coisas

## v0.1.2, 2026-11-10

- O contador de pendência do `NavList` (no ícone do trilho e no atalho) volta a ser branco sobre o amarelo, como era no
  CMMS: `text-warning-foreground` deixava o número quase preto

## v0.1.1, 2026-11-03

- O que o CMMS precisava para trocar as cópias dele pelo pacote sem mudar nada na tela
- `provideUi` aceita `navLink` (o link do trilho e da gaveta, para o app que pré-carrega no hover) e `formatNumber` (o
  número da mira dos gráficos no idioma do app), e `extendUi` troca parte da configuração só numa subárvore
- `NavRail`, `ShellTopbar` e `BottomNav` recebem `controlAttrs`, atributos extras no botão de fixar, no botão da gaveta e
  na barra, para ganchos do próprio app como o passo de um tour
- `ScreenSkeleton` aceita `class`, para o app cuja tela fica sobre outra superfície que não a página
- `@staackyz/ui/charts` exporta `loadChartCanvas`, para a tela que pré-carrega o gráfico antes de desenhar
- O preset escreve as cores como `hsl(var(--x))`: o modificador de opacidade (`bg-primary/10`) continua funcionando, e cada
  utilitário de cor volta a ser uma declaração só (8 kB a menos no CSS do CMMS)
- `sideEffects` só nos `.css`: o componente que o app não usa sai do bundle

## v0.1.0, 2026-11-03

- Primeira versão, extraída do Staackyz CMMS
- Tokens e CSS base: temas `blue` (o CMMS) e `emerald` (o Life), elevação, foco, barra de rolagem, seleção e o preset
  Tailwind com cores, raio derivado de `--radius`, `text-2xs` e Manrope
- Vocabulário de movimento: tokens `--mov-*` e as classes de entrada, toque, troca, gaveta, lista viva, saídas, destaque,
  espera e barra, todas com `prefers-reduced-motion`
- Script de movimento: `staggeredEntrance`, `vEnter`, `vEnterOnView`, `useEntranceQueue`, `useCountUp`, `useJustChanged`,
  `playEntrancesOnce`, `sheetDuration`, `railClock`
- Primitivas shadcn-vue: avatar, button, card, checkbox, collapsible, dialog, dropdown-menu, input, label, separator,
  sheet, skeleton, tabs e tooltip
- Casca do produto: `AppShell`, `ShellTopbar`, `NavRail`, `NavList`, `NavDrawer`, `BottomNav`, `PhoneHubSheet`,
  `ScreenFrame`, `PageHeader`, `EmptyState`, `KpiFrame`, `StatCard`, `PeriodDelta`, `ListRow`, `ListRowLink` e
  `ScreenSkeleton`, com o texto por `provideUi`, prop ou slot
- Gráfico em `@staackyz/ui/charts`: `ChartFrame`, `ChartCanvas` assíncrono, `chartTheme` e a mira compartilhada
