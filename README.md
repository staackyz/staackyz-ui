# @staackyz/ui

O design compartilhado dos apps Staackyz: tokens de tema, o vocabulário de movimento, as primitivas shadcn-vue sobre
reka-ui e a casca do produto (barra do topo, trilho, gaveta, barra do celular, quadro de tela, cartão de número, linha
de lista e gráfico). Extraído do Staackyz CMMS, que continua sendo a referência quando aqui não diz nada.

Vai como código-fonte (`.vue`, `.ts` e `.css`), compilado pelo Vite e pelo Tailwind do próprio app, no mesmo modelo de
`@staackyz/board`. Não sabe nada de tenancy, de rota, de i18n nem de servidor: texto entra por prop, slot ou
`provideUi`, e a navegação recebe a lista pronta.

## Instalação

Sempre presa numa tag, nunca numa branch:

```json
"@staackyz/ui": "github:staackyz/staackyz-ui#v0.1.0"
```

O repositório é público, então `npm ci` não precisa de chave nem token no runner nem no servidor.

As dependências são `peerDependencies` com a versão exata que CMMS e Life já usam: vue 3.5.42, reka-ui 2.10.4,
lucide-vue-next 0.468.0, @vueuse/core 12.7.0, tailwindcss 3.4.17, tailwindcss-animate 1.0.7, class-variance-authority
0.7.1, clsx 2.1.1 e tailwind-merge 2.6.0. echarts 6.1.0 é opcional e só precisa existir no app que importa
`@staackyz/ui/charts`.

No app:

- `vite.config.ts`: `optimizeDeps: { exclude: ['@staackyz/ui'] }`, o prebundle do dev não lê `.vue`
- `tailwind.config.js`: o preset e o caminho do pacote no `content`

```js
import ui from '@staackyz/ui/tailwind-preset';

export default {
    presets: [ui],
    content: ['./resources/js/**/*.{vue,ts}', './node_modules/@staackyz/ui/src/**/*.{vue,ts}'],
    // tailwindcss-animate já vem no preset, não repita em plugins
};
```

- `resources/css/app.css`, nesta ordem. O movimento vem depois dos utilitários, porque `mov-toque` e `mov-cartao`
  relistam as cores que `transition-colors` declara, e por isso as diretivas viram `@import`:

```css
@import '@fontsource-variable/manrope';
@import '@staackyz/ui/css/themes/emerald.css';
@import '@staackyz/ui/css/base.css';
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
@import '@staackyz/ui/css/motion.css';

/* daqui para baixo o que é só do app */
```

- uma vez no componente raiz, as palavras e o link que os componentes usam:

```ts
import { provideUi } from '@staackyz/ui';
import { Link, router } from '@inertiajs/vue3';

provideUi({
    link: Link,
    navigate: (href) => router.visit(href),
    labels: () => ({
        close: t('common.close'),
        skipToContent: t('common.skip_to_content'),
        mainNavigation: t('common.main_navigation'),
        openMenu: t('nav.open'),
        menuTitle: t('nav.title'),
        menuDescription: t('nav.description'),
        railExpand: t('nav.rail.expand'),
        railPin: t('nav.rail.pin'),
        railCollapse: t('nav.rail.collapse'),
        pending: (count) => t('nav.pending', { count: String(count) }),
        hubScreens: (hub) => t('nav.hub', { hub }),
        expected: (value) => t('metrics.expected', { value }),
    }),
});
```

Sem `provideUi` os componentes caem num inglês de reserva, para nenhum nome acessível ficar vazio. O texto de tela do
app continua só nos arquivos de tradução dele.

- se o app quer que uma entrada já vista não toque de novo depois do F5, `playEntrancesOnce(document, { itemAttributes })`
  no boot, com os atributos que dão nome aos itens dele (o padrão é `data-card-id`, `data-item-id` e `data-kpi`)

## Tema

Um tema é um arquivo só de variáveis HSL em `:root, .theme-light` e `.dark`, as mesmas que o preset lê:
`background`, `foreground`, `card`, `field`, `popover`, `primary`, `secondary`, `muted`, `accent`, `border`, `input`,
`input-focus`, `field-focus`, `ring`, `radius` e os quatro significados (`destructive`, `success`, `warning`, `info`)
com os degraus `DEFAULT`, `foreground`, `soft` e `strong`. `positive`, `negative` e `caution` (o botão que muda algo
importante) e a elevação são os mesmos em todo app e moram em `base.css`.

| Tema | De onde vem | Página | Cartão | Primária | Raio |
|---|---|---|---|---|---|
| `blue` | o CMMS, valor por valor | `#E7EDF6`, escuro `#0B111E` | `#F5F8FC`, escuro `#121A2B` | `#2563EB`, escuro `#3B82F6` | 12px |
| `emerald` | o Life, valor por valor | `#EAF3EE`, escuro `#071A12` | `#FFFFFF`, escuro `#0F2419` | `#15803D`, escuro `#4ADE80` | 10px |

Para mudar só uma cor, o app escreve a variável depois do import do tema, num `@layer base { :root { ... } }` dele.
Cor que só um app tem (os pilares e a faixa noturna do Life, as categorias, o calor e o site do CMMS) fica no app,
somada ao preset em `theme.extend.colors`.

### Contraste medido

`blue`, claro: texto sobre cartão 18.59, sobre página 16.82; texto apagado sobre cartão 5.40, página 4.89, muted 4.74;
borda sobre cartão 1.30. A primária como texto direto na página mede 4.39, então link de texto mora no cartão. Escuro:
texto sobre cartão 16.65, apagado 6.78. A borda de campo fica em 1.23 e 1.19 por decisão do dono (o campo se acha pelo
rótulo, pelo placeholder e pelo foco).

`emerald`, claro: texto sobre cartão 19.33, sobre página 17.08; apagado sobre cartão 6.88, página 6.08, muted 5.67;
rótulo branco na primária 5.02; primária como texto no cartão 5.02 e na página 4.43 (link na página usa
`accent-foreground`, 9.11); borda de campo 3.35 sobre branco. Escuro: texto sobre cartão 15.64, apagado 6.40, rótulo
na primária 8.55. O sucesso é teal e não verde, a 31 graus da primária, e sempre vem com ícone de visto.

Nos dois, o bloco cheio de `success` e `warning` no claro fica abaixo de 3:1 sobre o cartão: serve para barra e ponto ao
lado de um rótulo, nunca sozinho. Pílula é sempre `soft` com texto `strong` (de 4.51 a 5.49).

## Peças

Primitivas (`ui/`, shadcn-vue sobre reka-ui): `Avatar`, `Button` (`default`, `destructive`, `positive`, `negative`,
`caution`, `outline`, `outline-success`, `outline-destructive`, `secondary`, `ghost`, `link`), `Card`, `Checkbox`,
`Collapsible`, `Dialog` (e `DialogScrollContent`), `DropdownMenu`, `Input`, `Label`, `Separator`, `Sheet`, `Skeleton` e
`SkeletonRows`, `Tabs`, `Tooltip`, mais `radixEnter`, `radixOverlay`, `radixPopIn` e `radixTooltipPopIn`.

| Peça | O que faz |
|---|---|
| `AppShell` | A linha da tela: slots `rail`, `topbar`, o padrão (a tela), `aside` e `bottom`, e o link de pular para o conteúdo (`#main-content`) |
| `ShellTopbar` | Nome e ícone da tela à esquerda, o botão da gaveta entre md e lg, slots padrão (ferramentas), `after-title` e `account` |
| `NavRail` | O trilho de 4rem que espia em 16rem sob o mouse e fixa a partir de lg, pelo `clip-path`, nunca pela largura |
| `NavDrawer` | A mesma lista numa gaveta entre md e lg, fecha ao navegar |
| `NavList` | O corpo único do trilho e da gaveta: atalhos, grupos que dobram (lembrados em `collapseKey`), contador de pendência, slots `mark`, `brand` e `footer` |
| `BottomNav`, `PhoneHubSheet` | A faixa de hubs do celular e a folha com as telas do hub, que fecha pelo voltar do aparelho; hub com `menu: true` desenha o slot `menu` do app |
| `ScreenFrame` | A tela que é dona da própria altura, cabeçalho parado e corpo que rola (`.screen-scroll`) |
| `PageHeader` | Título só quando a barra não o mostra, e o slot `actions` |
| `EmptyState` | Ícone fino, uma frase e no máximo uma ação |
| `KpiFrame`, `StatCard`, `useStatValue` | O cartão de número, com contagem, escala pelo comprimento e faísca em SVG |
| `PeriodDelta` | Quanto o número andou contra o período anterior, a cor pelo sentido (`up_good`, `up_bad`, `neutral`) e o texto por `short` e `sentence` |
| `ListRow`, `ListRowLink` | Uma linha por item, a linha inteira abre e as ações vão no menu do fim |
| `ScreenSkeleton` | O contorno de uma tela lenta (`board`, `list`, `tiles`) por cima da que está saindo |

Navegação: o app monta `ShellNav` (`shortcuts` e `groups`) e `PhoneNav` (`phoneNavAt(hubs, url)` acende o hub pelo
caminho mais longo) já filtrados pelo que a pessoa pode abrir, e passa `currentPath`. Esconder um item aqui nunca é
controle de acesso: a rota continua checando no servidor.

Gráfico, em `@staackyz/ui/charts`: `ChartFrame` (só busca o ECharts quando o cartão chega perto da tela, reservando a
altura), `ChartCanvas` (sempre assíncrono, registra linha, barra e dispersão, e a mira compartilhada das linhas),
`chartTheme` e as funções da mira (`crosshairSeries`, `withCrosshair`, `expectedIdOf`).

Script de movimento: `staggeredEntrance`, `vEnter`, `vEnterOnView`, `useEntranceQueue`, `useCountUp`, `useJustChanged`,
`playEntrancesOnce`, `reducedMotion`, `sheetDuration`, `railClock`, `cn`.

## Movimento, em resumo

- duração, curva e escala saem dos tokens `--mov-*` de `motion.css`, nunca de um número na tela. Três durações
  (`--mov-curto` 130ms no toque, `--mov-medio` 220ms na chegada, `--mov-longo` 420ms na ênfase), duas curvas
  (`--mov-chegada` para o que chega, `--mov-volta` para o que vai e volta pelo mesmo caminho) e nenhuma curva de mola
- o que sai é mais rápido que o que chega; superfície grande usa `--mov-amplo` e `--mov-amplo-saida`
- só `opacity` e `transform` (escala é transform). Altura anima pela `gaveta` (`<Transition name="gaveta">`) ou por
  `.fold-rows[data-open]`, que vão de `0fr` a `1fr`
- número que se lê conta em `--mov-conta` (1100ms) pelo `useCountUp`; abaixo de 800ms ele só aparece
- lista entra em cascata com `--mov-passo` até `STAGGER_CAP` (14), o resto entra junto com o último; uma fila por tela
  (`useEntranceQueue`), não uma por `v-for`
- `prefers-reduced-motion` zera a transição e também o estado de origem, senão sobra um quadro transparente. A cor
  continua respondendo, porque é ela que confirma o clique
- nada encolhe ao apertar um cartão ou uma linha com botões dentro; o cartão sobe `--mov-lift` sob o mouse
- loop infinito só em espera (`mov-pulsa`, `mov-esqueleto`), nunca `linear` fora de relógio
- tudo que flutua usa `elevation-float` ou `elevation-float-sm`, nunca `shadow-md`, `shadow-lg` ou `shadow-xl`
  (`tests/elevation.test.mjs` barra)

As classes guardam o nome do CMMS, para ele migrar sem renomear: `mov-entra`, `mov-entra-leve`, `mov-entra-fim`,
`mov-entra-linha`, `mov-toque`, `mov-cartao`, `mov-icone`, `mov-troca`, `mov-texto`, `mov-titulo`, `mov-chega`,
`mov-bloco`, `mov-pop`, `mov-erro`, `mov-aviso`, `gaveta`, `fold-rows`, `live`, `live-row`, `mov-dispensa`,
`mov-conclui`, `item-flash` (`[data-selected]`), `destaque` e `destaque-mudou`, `mov-pulsa`, `mov-esqueleto`,
`mov-atualiza`, `mov-barra` e `mov-barra-enche`, `nav-rail`.

## Do CMMS para o pacote

O que muda de nome no script (as classes CSS não mudam): `vEntra` virou `vEnter` (`{ place, variant }`),
`vEntraAoAparecer` virou `vEnterOnView`, `curvaDeChegada` virou `arrivalEasing`, as variantes `padrao`, `linha` e
`cartao` viraram `default`, `row` e `card`, e `useCountUp` recebe `{ decimals, fromZero, format }` e devolve
`{ value, text }`.

## Versão

Mudou, `npm run ci` (prettier, eslint, `vue-tsc --noEmit` e `npm test`, o mesmo que o CI deste repositório roda), sobe
`version`, registra no `CHANGELOG.md`, commit, tag `vX.Y.Z` e push da tag. Cada app troca de tag na própria PR, com os
próprios testes.
