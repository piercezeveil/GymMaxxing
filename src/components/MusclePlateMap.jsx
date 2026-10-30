const palette = {
  peito: '#a778ff',
  costas: '#70adff',
  ombros: '#f5aa73',
  braços: '#ef82ad',
  abdômen: '#70d6a5',
  pernas: '#e4c46c',
  glúteos: '#e997c0',
}

const mixChannel = (from, to, amount) => Math.round(from + ((to - from) * amount))

const muscleFill = (setVolume, group) => {
  const sets = setVolume[group] || 0
  if (!sets || !palette[group]) return '#303030'

  const target = palette[group].match(/[\da-f]{2}/gi).map((channel) => Number.parseInt(channel, 16))
  const intensity = Math.min(1, .18 + ((Math.min(sets, 12) / 12) * .82))
  return `rgb(${mixChannel(48, target[0], intensity)} ${mixChannel(48, target[1], intensity)} ${mixChannel(48, target[2], intensity)})`
}

function FigureUnderlay() {
  return <g className="anatomy-underlay">
    <path d="M150 24c-11 17-27 29-48 37-18 7-30 22-34 43-4 25 2 52 14 79l13 50c5 22 15 41 30 57-18 17-29 42-31 74l2 93c1 18 7 36 15 52-8 24-12 53-11 86l3 72c3 18 14 25 28 13l19-162 19 162c14 12 25 5 28-13l3-72c1-33-3-62-11-86 8-16 14-34 15-52l2-93c-2-32-13-57-31-74 15-16 25-35 30-57l13-50c12-27 18-54 14-79-4-21-16-36-34-43-21-8-37-20-48-37z" />
    <path d="M70 103c-15 11-22 32-19 63l-11 66-11 54c0 16 9 24 23 20l22-57 15-79-2-45z" />
    <path d="M230 103c15 11 22 32 19 63l11 66 11 54c0 16-9 24-23 20l-22-57-15-79 2-45z" />
  </g>
}

function FrontFigure({ setVolume }) {
  const fill = (group) => muscleFill(setVolume, group)

  const side = <g>
    {/* Cintura escapular */}
    <path className="muscle-region" d="M148 26 128 54 107 66l12 30 29-24z" fill={fill('costas')} />
    <path className="muscle-region" d="M108 65C89 61 72 70 61 85c-4 12 0 26 10 35 12 2 24-5 33-18l9-22z" fill={fill('ombros')} />

    {/* Peito e parede abdominal */}
    <path className="muscle-region" d="M145 68c-15-9-32-10-47-2-6 10-7 24-2 37 13 12 29 16 49 11z" fill={fill('peito')} />
    <path className="muscle-region" d="M98 103c-6 17-7 37-4 58l17 15 18-20-2-40z" fill={fill('abdômen')} />
    <path className="muscle-region" d="M94 160c-2 29 3 58 14 83l21 6 8-47-11-47-15 21z" fill={fill('abdômen')} />
    <path className="muscle-region" d="M108 242c9 8 23 12 41 12v53l-24 2c-13-14-22-31-27-51z" fill={fill('abdômen')} />

    {/* Braço e antebraço, unidos no cotovelo */}
    <path className="muscle-region" d="M71 118c-11 11-16 28-15 47 3 15 9 25 18 31 10-8 15-22 16-41l-2-29-9-10z" fill={fill('braços')} />
    <path className="muscle-region" d="M87 126c-4 22-4 42 1 59l-14 11c-9-6-15-16-18-31-1-19 4-36 15-47l8-2z" fill={fill('braços')} />
    <path className="muscle-region" d="M58 181c-9 16-14 37-16 61l-10 47c4 11 12 14 21 8l17-49 7-55-7-13z" fill={fill('braços')} />
    <path className="muscle-region" d="M70 193c2 18 0 37-5 57l-12 47c5 5 11 3 15-4l18-51 1-44-9-14z" fill={fill('braços')} />

    {/* Quadril e quadríceps */}
    <path className="muscle-region" d="M108 304c-9 18-13 43-12 74l4 74c3 20 11 34 22 41l8-28-2-134-7-27z" fill={fill('pernas')} />
    <path className="muscle-region" d="M121 304c-7 28-9 60-7 96l5 92c7 7 15 4 21-8l4-136-7-44z" fill={fill('pernas')} />
    <path className="muscle-region" d="M137 304c-4 31-5 65-3 103l6 77 9 12V304z" fill={fill('pernas')} />

    {/* Joelho e perna, sem vão entre as peças */}
    <path className="muscle-region" d="M100 452c3 20 10 34 22 41 7 2 13-1 18-9l3 23-11 16h-25l-12-17z" fill={fill('pernas')} />
    <path className="muscle-region" d="M107 506c-10 17-14 40-13 68l7 94c5 15 15 19 25 8l10-94-5-64-12-25z" fill={fill('pernas')} />
    <path className="muscle-region" d="M131 518c-6 22-8 48-6 78l1 80 10-14 10-91-6-54z" fill={fill('pernas')} />
  </g>

  return <svg className="muscle-silhouette muscle-plate anatomical-muscle-plate" viewBox="0 0 300 700" role="img" aria-label="Mapa anatômico da musculatura frontal">
    <title>Musculatura frontal: peito, ombros, braços, abdômen e pernas</title>
    <FigureUnderlay />
    <g className="muscle-regions">
      {side}
      <g transform="translate(300 0) scale(-1 1)">{side}</g>

      <path className="muscle-region abdominal-line" d="M148 70h4v237h-4z" fill={fill('abdômen')} />
      <path className="muscle-region abdominal-segment" d="M130 114c5 3 11 4 17 2v29h-18c-3-10-3-21 1-31z" fill={fill('abdômen')} />
      <path className="muscle-region abdominal-segment" d="M153 116c6 2 12 1 17-2 4 10 4 21 1 31h-18z" fill={fill('abdômen')} />
      <path className="muscle-region abdominal-segment" d="M129 148h18v31h-19c-2-11-2-21 1-31z" fill={fill('abdômen')} />
      <path className="muscle-region abdominal-segment" d="M153 148h18c3 10 3 20 1 31h-19z" fill={fill('abdômen')} />
      <path className="muscle-region abdominal-segment" d="M129 182h18v31h-18c-3-10-3-21 0-31z" fill={fill('abdômen')} />
      <path className="muscle-region abdominal-segment" d="M153 182h18c3 10 3 21 0 31h-18z" fill={fill('abdômen')} />
      <path className="muscle-region abdominal-segment" d="M131 216h16v34l-18-4c-2-11-1-21 2-30z" fill={fill('abdômen')} />
      <path className="muscle-region abdominal-segment" d="M153 216h16c3 9 4 19 2 30l-18 4z" fill={fill('abdômen')} />
    </g>
    <g className="muscle-fibers">
      <path d="M102 72c14 9 28 14 43 16M68 88c12 4 23 9 31 17M62 132c8 15 12 31 11 47M49 207c9 10 14 22 16 36M98 118l25 26M104 174l26 24M101 331c14 39 20 85 17 140M124 321c12 47 16 96 12 150M105 525c12 39 15 83 10 132M198 72c-14 9-28 14-43 16M232 88c-12 4-23 9-31 17M238 132c-8 15-12 31-11 47M251 207c-9 10-14 22-16 36M202 118l-25 26M196 174l-26 24M199 331c-14 39-20 85-17 140M176 321c-12 47-16 96-12 150M195 525c-12 39-15 83-10 132" />
    </g>
  </svg>
}

function BackFigure({ setVolume }) {
  const fill = (group) => muscleFill(setVolume, group)

  const side = <g>
    {/* Trapézio, deltoide posterior e escápula */}
    <path className="muscle-region" d="M148 25c-10 19-27 32-49 40l18 53 31 35z" fill={fill('costas')} />
    <path className="muscle-region" d="M103 65C84 62 68 71 59 87c-3 13 2 26 13 34 13 1 25-7 33-20l8-21z" fill={fill('ombros')} />
    <path className="muscle-region" d="M112 79c-4 14-2 29 6 45l26 29 4-68-20-27z" fill={fill('costas')} />
    <path className="muscle-region" d="M103 102c-10 7-16 18-18 34l24 22 29-18-22-30z" fill={fill('costas')} />

    {/* Dorsal e lombar convergindo para a cintura */}
    <path className="muscle-region" d="M86 135c-2 32 4 63 19 91 10 13 23 22 38 27l5-100-34-16-12 21z" fill={fill('costas')} />
    <path className="muscle-region" d="M104 222c6 25 16 46 29 62l15-4v-86l-9 58c-14-5-25-15-35-30z" fill={fill('costas')} />
    <path className="muscle-region" d="M105 252c9 14 23 24 43 28v29l-25-2c-13-10-22-22-28-36z" fill={fill('costas')} />

    {/* Tríceps e antebraço contínuos */}
    <path className="muscle-region" d="M71 119c-11 11-16 28-14 48 3 16 9 26 19 31 10-8 15-23 16-42l-3-29-9-10z" fill={fill('braços')} />
    <path className="muscle-region" d="M88 127c-3 23-3 43 2 60l-14 11c-10-5-16-15-19-31-2-20 3-37 14-48l9-2z" fill={fill('braços')} />
    <path className="muscle-region" d="M59 183c-9 16-14 37-16 61l-10 48c4 11 13 14 22 7l17-49 6-55-7-13z" fill={fill('braços')} />
    <path className="muscle-region" d="M71 195c2 18 0 37-5 57l-11 47c5 5 11 2 15-5l17-50 1-44-9-14z" fill={fill('braços')} />

    {/* Glúteo ligado ao tronco e ao posterior da coxa */}
    <path className="muscle-region" d="M148 303c-20-7-39-2-52 15-7 23-4 49 8 75 11 17 24 23 39 18l5-73z" fill={fill('glúteos')} />
    <path className="muscle-region" d="M143 349c-14 4-26 14-36 28l-3 16c11 17 24 23 39 18l5-62z" fill={fill('glúteos')} />

    {/* Posterior da coxa */}
    <path className="muscle-region" d="M104 391c-9 22-12 48-9 78l7 58c6 15 16 23 29 21l10-122-10-35z" fill={fill('pernas')} />
    <path className="muscle-region" d="M131 391c-6 33-7 68-4 105l4 52c7 5 13 1 18-10V391z" fill={fill('pernas')} />

    {/* Joelho e panturrilha unidos */}
    <path className="muscle-region" d="M102 527c6 15 16 23 29 21l13 2-10 24-25 2-13-17z" fill={fill('pernas')} />
    <path className="muscle-region" d="M109 570c-12 12-17 34-15 64l7 38c7 13 17 15 27 4l8-62-9-40-18-15z" fill={fill('pernas')} />
    <path className="muscle-region" d="M127 574c-6 20-7 43-3 68l4 34c6 8 12 4 16-6l7-58-13-38z" fill={fill('pernas')} />
  </g>

  return <svg className="muscle-silhouette muscle-plate anatomical-muscle-plate" viewBox="0 0 300 700" role="img" aria-label="Mapa anatômico da musculatura posterior">
    <title>Musculatura posterior: costas, ombros, braços, glúteos e pernas</title>
    <FigureUnderlay />
    <g className="muscle-regions">
      {side}
      <g transform="translate(300 0) scale(-1 1)">{side}</g>
      <path className="muscle-region spinal-line" d="M148 84h4v225h-4z" fill={fill('costas')} />
    </g>
    <g className="muscle-fibers">
      <path d="M104 67c15 15 29 27 43 38M68 87c13 4 24 9 33 17M94 131c15 8 28 17 39 29M91 164c12 25 28 46 47 63M62 133c8 15 12 31 11 47M50 210c9 10 14 22 16 36M103 321c14 12 27 19 40 22M108 409c13 35 18 76 15 122M104 590c13 22 18 47 16 75M196 67c-15 15-29 27-43 38M232 87c-13 4-24 9-33 17M206 131c-15 8-28 17-39 29M209 164c-12 25-28 46-47 63M238 133c-8 15-12 31-11 47M250 210c-9 10-14 22-16 36M197 321c-14 12-27 19-40 22M192 409c-13 35-18 76-15 122M196 590c-13 22-18 47-16 75" />
    </g>
  </svg>
}

export default function MusclePlateMap({ setVolume }) {
  return <div className="muscle-map muscle-plate-map anatomical-plate-map">
    <div className="muscle-silhouette-grid">
      <div className="muscle-view">
        <span className="muscle-view-label">FRENTE</span>
        <FrontFigure setVolume={setVolume} />
      </div>
      <div className="muscle-view">
        <span className="muscle-view-label">COSTAS</span>
        <BackFigure setVolume={setVolume} />
      </div>
    </div>
    <div className="muscle-anatomy-key">
      <span><b>Peito</b> · deltoide · bíceps</span>
      <span><b>Abdômen</b> · quadríceps · tibial</span>
      <span><b>Costas</b> · trapézio · dorsais · lombar</span>
      <span><b>Glúteos</b> · posteriores · panturrilha</span>
    </div>
  </div>
}
