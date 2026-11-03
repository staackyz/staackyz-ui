# Changelog

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
