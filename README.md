# Memo Test

Juego de memoria: elegís un memo test, das vuelta cartas de a dos y buscás los pares de imágenes. Cada click cuenta como un intento; una partida perfecta vale 100 puntos. Las partidas se pueden dejar a medias y continuar después.

Este repo es el frontend. El backend (Laravel + GraphQL + MySQL) está en [api-memo-test](https://github.com/diegomottadev/api-memo-test). **El backend es opcional**: sin él, o si no responde, la app usa datos de ejemplo y funciona completa.

Demo: https://diegomottadev.github.io/memo-test/ (modo demo, con datos de ejemplo).

## Capturas

|         | Claro                                                               | Oscuro                                                              |
| ------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Desktop | ![Inicio, claro, desktop](docs/screenshots/home-light-desktop.png)  | ![Inicio, oscuro, desktop](docs/screenshots/home-dark-desktop.png)  |
| Desktop | ![Partida, claro, desktop](docs/screenshots/game-light-desktop.png) | ![Partida, oscuro, desktop](docs/screenshots/game-dark-desktop.png) |
| Mobile  | ![Inicio, claro, mobile](docs/screenshots/home-light-mobile.png)    | ![Inicio, oscuro, mobile](docs/screenshots/home-dark-mobile.png)    |
| Mobile  | ![Partida, claro, mobile](docs/screenshots/game-light-mobile.png)   | ![Partida, oscuro, mobile](docs/screenshots/game-dark-mobile.png)   |

## Stack

- React 19, React Router 7 (`react-router`), Vite 8.
- CSS Modules + design tokens (`oklch`, modo claro/oscuro automático).
- GraphQL con `fetch` propio (sin Apollo); datos de ejemplo en el navegador como alternativa.
- Vitest + Testing Library + jsdom; ESLint 9 (flat config, `jsx-a11y`); Prettier 3.
- PropTypes en todos los componentes (validados por ESLint).

## Requisitos

- Node.js 20.19 o superior (probado con Node 24) y npm.
- Opcional: Docker, para levantar el backend.

## Inicio rápido (sin backend)

```bash
git clone https://github.com/diegomottadev/memo-test
cd memo-test
npm install
npm run dev
```

Abrí http://localhost:5173. Sin `VITE_API_URL`, la app usa los datos de ejemplo y lo avisa con un cartel "Demo mode".

## Con el backend real

1. Levantá el backend (un solo comando, ver su README):

   ```bash
   git clone https://github.com/diegomottadev/api-memo-test
   cd api-memo-test
   docker compose up -d
   ```

   La primera vez tarda unos minutos (instala dependencias, crea la base y carga datos). Queda en http://localhost:82/graphql.

2. En este repo, configurá la URL y arrancá:

   ```bash
   cp .env.example .env.local   # VITE_API_URL=http://localhost:82/graphql
   npm run dev
   ```

### De dónde salen los datos

| Situación                                      | Qué hace la app                                                               |
| ---------------------------------------------- | ----------------------------------------------------------------------------- |
| `VITE_API_URL` vacía o sin definir             | Usa los datos de ejemplo desde el inicio.                                     |
| `VITE_API_URL` definida y el servidor responde | Usa el backend.                                                               |
| El servidor no responde                        | Pasa sola a los datos de ejemplo, repite la operación ahí y muestra un aviso. |

"No responde" significa: error de red, más de 5 segundos sin respuesta, un status HTTP de error o una respuesta que no es JSON. Un error GraphQL (el servidor respondió, pero con un error) se muestra como error y no activa el cambio. Una vez que cambió, la app sigue con los datos de ejemplo hasta recargar la página, para no mezclar datos de los dos lados.

Los datos de ejemplo (y sus puntajes) se guardan en el `localStorage` del navegador.

## Comandos

| Comando           | Qué hace                                                         |
| ----------------- | ---------------------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo en http://localhost:5173.                 |
| `npm run build`   | Build de producción en `dist/`.                                  |
| `npm run preview` | Sirve `dist/` para probar el build.                              |
| `npm test`        | Tests una vez (`npm run test:watch` para modo watch).            |
| `npm run lint`    | ESLint.                                                          |
| `npm run format`  | Formatea todo con Prettier (`npm run format:check` solo revisa). |
| `npm run deploy`  | Publica en GitHub Pages (ver abajo).                             |

Antes de subir cambios: `npm test && npm run lint && npm run format:check && npm run build`.

## Cómo se juega

1. Elegí un memo test y tocá **Start** (o **Continue** si tenés una partida a medias).
2. Dá vuelta una carta y después otra. Si muestran la misma imagen, quedan boca arriba; si no, se dan vuelta solas al segundo.
3. Encontrá todos los pares. Puntaje = cartas ÷ clicks × 100 (cada click en una carta cuenta).

También se juega con teclado (Tab para moverse, Enter para dar vuelta) y con lector de pantalla: cada carta dice su estado y cada jugada se anuncia ("Pair found! Dog.").

## Estructura

```
src/
  api/          única capa que hace fetch: graphqlRequest, memoTestApi (GraphQL), mocks/, createApi (fallback)
  hooks/        useAsync (lecturas), useAsyncAction (escrituras), useMemoGame, useDataSource, useFocusOnMount
  hocs/         withAsyncState (cargando/error/vacío), withErrorBoundary
  components/   <Nombre>/<Nombre>.jsx + <Nombre>.module.css + index.js (presentacionales, con propTypes)
  pages/        Home, GameSession (+ GamePlay), NotFound
  constants/    config, rutas, juego, claves de localStorage, links, stats, pasos de ayuda
  styles/       tokens.css (diseño) y base.css (reset)
  types/        PropTypes compartidos
  utils/        reglas del juego (funciones puras), localStorage seguro, títulos
  testUtils/    renderWithProviders, mock de la API, setup de tests
scripts/deploy.sh
docs/screenshots/
```

Convenciones principales:

- Solo las páginas (y sus hooks) tienen estado; los componentes reciben props.
- Opciones configurables en arrays de `constants/` (links, stats, pasos de ayuda): agregar una opción es agregar un objeto.
- Ningún color o tamaño literal fuera de `src/styles/tokens.css`.
- Todo el texto del código (UI, comentarios, tests) en inglés simple; JSDoc en todo lo exportado.
- Tests al lado del código (`*.test.js(x)`), con queries por rol/label/texto y la capa `api/` mockeada con `vi.mock`.

## Deploy a GitHub Pages

```bash
DRY_RUN=1 npm run deploy   # muestra qué se publicaría, sin commit ni push
npm run deploy             # build y publica en la rama gh-pages
```

El script (`scripts/deploy.sh`):

- Hace el build con base `/<nombre del repo>/` y **sin URL de API** (datos de ejemplo). Para apuntar a un backend público: `DEPLOY_API_URL=https://... npm run deploy`; si ese servidor no responde, la app cambia sola a los datos de ejemplo.
- Prepara la rama `gh-pages` en un worktree temporal (la crea la primera vez), agrega `.nojekyll`, hace commit con tu usuario de git y push **sin** `--force`.

La primera vez, en GitHub: **Settings → Pages → Deploy from a branch → `gh-pages` / root**.

`dev`, `build` y `preview` locales sirven desde `/`; solo el deploy usa el subpath.

## Decisiones

- **Sin Apollo.** Son 5 operaciones simples y no se usaba la caché; un `fetch` propio en `api/` permite inyectar `baseUrl`/`fetchImpl` en tests, cancelar con `AbortController` y decidir el fallback. El bundle bajó de ~465 KB a ~285 KB.
- **`404.html` en lugar de `HashRouter`.** Pages no tiene rutas del lado del servidor; el build copia `index.html` a `404.html`, así un link directo (`/memo-test/game/1/...`) carga la app y `BrowserRouter` resuelve la ruta. Las URLs quedan limpias. Costo: el primer pedido a una ruta profunda responde HTTP 404 aunque la página se vea bien.
- **HOCs para estados de render, hooks para lógica.** `withAsyncState` y `withErrorBoundary` resuelven lo que se repetía en cada pantalla; el estado de la partida y las llamadas viven en hooks.
- **La partida guardada en el navegador es la fuente de verdad para "Continue"**; el backend recibe el progreso en cada par encontrado y el puntaje final.
- **Interfaz en inglés simple**, como el resto del código.

## Limitaciones conocidas

- El backend tiene `endGameSession` en el schema pero sin implementación: las sesiones nunca pasan a `Completed`; solo se guarda el puntaje.
- El "Best score" del backend incluye partidas sin terminar (puntaje 0), por eso puede mostrar `Best score: 0`.
- El backend no tiene descripción de las imágenes: para lectores de pantalla se llaman "Picture 1", "Picture 2"… (los datos de ejemplo sí tienen nombres).
- Las imágenes del backend son links a sitios de terceros; si alguno se cae, esa carta se ve rota.
- Después de cambiar a datos de ejemplo, la app no vuelve a intentar con el servidor hasta recargar.
- No hay usuarios: los puntajes son globales (backend) o de este navegador (datos de ejemplo).

## Pendiente: checklist para seguir aprendiendo

Tareas ordenadas por dificultad para quien retome el proyecto. Cada una dice dónde mirar y qué se practica. Antes de dar una por terminada: `npm test && npm run lint && npm run format:check && npm run build`, y un test nuevo que la cubra.

### Nivel inicial

- [ ] **Agregar un memo test a los datos de ejemplo.** Dónde: `src/api/mocks/fixtures.js`. Practicás: el modelo de datos que usa toda la UI.
- [ ] **Agregar un paso a la ayuda o una estadística nueva** (por ejemplo, porcentaje de aciertos). Dónde: `src/constants/howToPlay.js`, `src/constants/stats.js`. Practicás: configuración por arrays sin tocar componentes.
- [ ] **Ocultar "Best score" cuando vale 0.** Dónde: `src/components/MemoTestItem/`. Practicás: render condicional y su test.
- [ ] **Sumar una variante `danger` a `Button`.** Dónde: `src/components/Button/`, `src/styles/tokens.css`. Practicás: tokens, CSS Modules y contraste AA en los dos modos.
- [ ] **Escribir los tests que faltan** de `GameStats`, `EmptyState` y `MemoTestList`. Dónde: junto a cada componente. Practicás: Testing Library con queries por rol y texto.

### Nivel intermedio

- [ ] **Cronómetro de partida** que se guarde al continuar. Dónde: `src/hooks/useMemoGame.js`, `src/utils/game.js`. Practicás: estado derivado, timers con limpieza y tests con `vi.useFakeTimers`.
- [ ] **Botón "Abandonar partida"** que borre la partida guardada. Dónde: `src/pages/GameSession/`, `src/utils/gameStorage.js`. Practicás: flujo de navegación y localStorage.
- [ ] **Elegir la cantidad de pares** (dificultad). Dónde: `src/utils/game.js` (`createDeck`). Practicás: funciones puras y sus tests.
- [ ] **Volver al servidor sin recargar** cuando responde de nuevo (hoy el modo demo dura hasta recargar). Dónde: `src/api/createApi.js`, `src/components/DataSourceNotice/`. Practicás: un store externo con `useSyncExternalStore`.
- [ ] **Animación de "par encontrado"** que respete `prefers-reduced-motion`. Dónde: `src/components/Card/`. Practicás: CSS y accesibilidad.
- [ ] **Tests end-to-end versionados con Playwright**, con auditoría de axe-core. Durante la modernización estas pruebas se hicieron con scripts temporales que no quedaron en el repo. Practicás: pruebas en un navegador real.
- [ ] **CI con GitHub Actions:** tests, lint, formato y build en cada Pull Request; deploy a Pages al mergear a `main`. Practicás: automatización.

### Nivel avanzado

- [ ] **Migrar a TypeScript.** Los `@typedef` de JSDoc (`Card`, `Game`, `MemoTest`) son el punto de partida. Practicás: tipos y migración gradual.
- [ ] **Separar el código por ruta** con `React.lazy` y medir el bundle. Practicás: rendimiento.
- [ ] **Interfaz en dos idiomas** (inglés y español) con un diccionario de textos. Practicás: i18n.
- [ ] **Modo offline (PWA)** con service worker; encaja con el modo demo. Practicás: caché y ciclo de vida del service worker.
- [ ] **Reemplazar `useAsync` por TanStack Query** y comparar el código. Practicás: caché de datos del servidor.
- [ ] **Usuarios y ranking** (junto con el backend). Practicás: autenticación de punta a punta.

### Necesitan cambios en el backend

Ver el checklist de [api-memo-test](https://github.com/diegomottadev/api-memo-test#pendiente-checklist-para-seguir-aprendiendo).

- [ ] Marcar la partida como `Completed` al terminar, cuando exista `endGameSession`.
- [ ] Mostrar descripciones reales de las imágenes (hoy "Picture 1", "Picture 2"…) cuando el backend las devuelva.
- [ ] Publicar el backend con HTTPS y desplegar el frontend con `DEPLOY_API_URL`, para que la demo use datos reales.
