# Changelog

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
