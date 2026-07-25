# Hero de Campeón de Temporada + Clasificados al Final Seven

**Fecha:** 2026-07-25
**Contexto:** Cierre del Apertura 2026

## Problema

El Apertura 2026 terminó (fecha #20, 21-jul-2026). Hernán es el campeón de la
temporada regular. El sitio sigue mostrando el podio de la última fecha en el
hero, como si la temporada estuviera en curso, y el Historial marca la
temporada como "En curso".

Además, el Final Seven todavía no se jugó: lo van a disputar los 8 primeros de
la tabla más Rasta, que ganó el Fraca. Esa información no está en ningún lado.

## Datos verificados

Tabla final del Apertura 2026 (20 fechas, 4-mar a 21-jul-2026):

| # | Jugador | Puntos | Fechas | Oros |
|---|---------|-------:|-------:|-----:|
| 1 | Hernán  | 86,50  | 18     | 3    |
| 2 | Galle   | 80,50  | 18     | 2    |
| 3 | Mou     | 62,50  | 20     | 1    |
| 4 | Ari     | 51,50  | 19     | 2    |
| 5 | Gabo    | 50,50  | 20     | 2    |
| 6 | Tala    | 48,50  | 20     | 1    |
| 7 | Shark   | 48,00  | 18     | 1    |
| 8 | Lean    | 46,50  | 16     | 1    |
| 9 | Rasta   | 45,00  | 19     | 2    |

Rasta ganó el Fraca, así que el Final Seven lo juegan 9: los 8 primeros más él.

## Concepto visual

**"El campeón se sale del marco."**

El podio semanal está contenido: círculos, anillos, badges numerados. Es
efímero, es una fecha. El campeón de temporada se lee como lo opuesto — sin
marco, sin círculo, sin recuadro. Una figura recortada casi a tamaño real con
tipografía grande al lado.

Esta oposición distingue al campeón sin inventar un lenguaje ajeno: el Hall of
Fame ya usa recortes de cuerpo entero sobre halo radial
(`HallOfFamePage.tsx:735`). Acá se extiende ese vocabulario sacando la figura
de la card.

## Alcance

### 1. Hero del campeón (HomePage)

Reemplaza `HeroPodium` en la columna derecha cuando la temporada está cerrada.

- **Foto**: `object-contain`, `h-[280px] md:h-[420px] lg:h-[500px]`,
  `drop-shadow-[0_8px_40px_rgba(0,0,0,0.7)]`. Sin `rounded`, sin `ring`, sin
  `overflow-hidden`. El PNG ya es transparente (843×1000 RGBA, 44% alfa cero).
- **Halo**: radial rojo `rgba(239,68,68,0.18)`, elíptico, ~500px, centrado bajo
  la figura para despegarla del `surface-1`.
- **Año como textura**: `2026` en `--font-nav` a ~200px, `color: transparent`,
  `-webkit-text-stroke: 1px rgba(255,255,255,0.06)`, detrás de la figura.
  Oculto en mobile.
- **Panel de datos**: píldora glass del HoF
  (`bg-white/[0.06] backdrop-blur-xl border-white/[0.1]`) sobre el borde
  inferior de la foto. Label `CAMPEÓN TEMPORADA REGULAR` en rojo con tracking
  ancho, el nombre grande, y los stats separados por puntos medios.
- **Motion**: `heroScale` con delay 0.3s. El halo respira lento. Nada más.
- **Sin corona, sin laureles, sin emojis de trofeo.** `/laureles.png` está
  referenciado en `SeasonPage.tsx:241` pero **no existe** en `public/`: hoy es
  un 404 silencioso. No se apoya nada nuevo en assets faltantes.
- **Condición**: se muestra si la temporada activa está `finished` y hay
  standings. Si no, cae al `HeroPodium` de siempre. Sirve tal cual para la
  Clausura 2026.

### 2. Temporada cerrada

`seasons.status` de `active` → `finished` para Apertura 2026.

El badge "Finalizado" aparece solo en la lista de Historial: el estilo ya está
definido en `HistorialPage.tsx:58`. Esa página no se toca.

Cerrar la temporada **no rompe el Home**: `useSeasons.ts:35` hace
`find(active) ?? seasons[0]`, y con el orden `year DESC, type ASC` el fallback
sigue siendo Apertura 2026.

### 3. Clasificados al Final Seven (SeasonPage)

`SeasonPage.tsx:94` muestra las cards de campeones cuando la temporada está
`finished`, y una es "Final Seven". Como el Final Seven de 2026 no se jugó,
hoy renderizaría una card vacía con un guión. **Se arregla en el mismo
movimiento**: si no hay campeón del Final Seven, en su lugar va el bloque de
clasificados.

Bloque, arriba de la tabla:

- Grilla de los 8 primeros con recorte chico, posición, nombre y puntos.
- Rasta en fila separada abajo, con divisoria y acento **dorado**, porque entró
  por otra puerta. Respeta la convención existente: rojo = zona Final, dorado =
  zona Fraca (`StandingsTable.tsx:294`).
- Fondo: `final7.png` (mesa de póker roja, ya en `public/`) al 8% de opacidad,
  rotada y clipeada en una esquina. Misma técnica que las cards del HoF con
  `champions.png`.

## Decisión: dónde vive el ganador del Fraca

**No se registra en la base de datos.** Los Fraca nunca se registraron
históricamente — `hall_of_fame` sólo tiene filas `final_seven`, y
`offline_events` está vacía. Empezar ahora con una sola entrada dejaría la
sección Fraca del Hall of Fame visible y casi vacía, leyéndose como incompleta.

Rasta queda como constante local en `data/playoffs.ts`: una línea que se edita
cuando cierre la próxima temporada. Registrar los Fraca en serio es una
decisión aparte, y requiere cargar los históricos completos.

## Archivos

| Archivo | Qué |
|---|---|
| `components/champion/ChampionHero.tsx` | *nuevo* — figura + halo + año outline + panel glass |
| `components/champion/CutoutPhoto.tsx` | *nuevo* — img recortada con fallback al mono, tamaños `hero`/`md`/`sm` |
| `components/season/FinalSevenQualifiers.tsx` | *nuevo* — grilla de 8 + fila de Rasta |
| `data/playoffs.ts` | *nuevo* — `FRACA_WINNERS`, hoy con una entrada |
| `pages/HomePage.tsx` | `HeroPodium` → `ChampionHero` con temporada cerrada |
| `pages/SeasonPage.tsx` | card de Final Seven vacía → bloque de clasificados |
| DB `seasons` | Apertura 2026: `active` → `finished` |

`CutoutPhoto` extrae la lógica de foto recortada que hoy está duplicada en
cuatro lugares de `HallOfFamePage.tsx`.

## Flujo de datos

Sin fetches nuevos y sin duplicar el ranking:

- `useSeasons` → temporada y su `status`
- `useStandings` → orden con los 8 criterios de desempate ya implementados
- `FRACA_WINNERS` → el noveno clasificado

## Fronteras

- `ChampionHero` recibe `{ player, points, events, golds, seasonName }` y no
  sabe de Supabase. Reusable para la Clausura 2026.
- `CutoutPhoto` sólo sabe de un `playerId` y un tamaño.
- `FinalSevenQualifiers` recibe `standings` y el id del ganador del Fraca.

## Manejo de errores

- Foto que no carga → fallback al mono (`getMonoFallback`), igual que hoy.
- Menos de 8 en la tabla → renderiza los que haya.
- Sin ganador de Fraca cargado → muestra los 8 y omite la fila dorada.
- Temporada sin cerrar → el camino nuevo queda inerte, el sitio se comporta
  como hoy.

## Verificación

No hay suite de tests en el repo. Se verifica con:

1. `pnpm build` — TypeScript strict, que es donde este proyecto se cae por
   imports sin usar.
2. La app levantada, mirando Home, `/historial` y `/historial/{Apertura 2026}`
   en desktop y mobile.

## Riesgos asumidos

1. Cerrar la temporada cambia el Home para todos apenas se aplica. El cambio de
   `status` va **al final**, con el resto ya funcionando.
2. `hernan.png` pesa 597 KB sin optimizar. Se comprime antes de usarlo a
   `h-[500px]`.

## Fuera de alcance

Detectados, no se tocan:

- `/laureles.png` faltante, 404 silencioso en `SeasonPage.tsx:241`.
- Sección Fraca vacía del Hall of Fame.
