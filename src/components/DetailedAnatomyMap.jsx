const palette = {
  peito: '#e85d58',
  ombros: '#e6b449',
  braços: '#df7a50',
  abdômen: '#7e6bd6',
  costas: '#4b98bd',
  glúteos: '#a66bc8',
  pernas: '#6eaf52',
}

const activeFill = (activeGroups, groups, fallback = '#27232f') => {
  const group = groups.find((item) => palette[item])
  if (!group) return fallback
  return activeGroups.has(group) ? palette[group] : `${palette[group]}66`
}

function AnatomyFigure({ view, activeGroups }) {
  const front = view === 'front'
  const fill = (...groups) => activeFill(activeGroups, groups)
  const muted = '#27232f'
  const base = '#302b38'
  const line = '#70647d'

  return <svg className="muscle-silhouette anatomy-figure" viewBox="0 0 260 720" role="img" aria-label={front ? 'Mapa anatômico muscular frontal' : 'Mapa anatômico muscular posterior'}>
    <title>{front ? 'Anatomia muscular frontal' : 'Anatomia muscular posterior'}</title>
    <g className="anatomy-base">
      <ellipse cx="130" cy="45" rx="27" ry="34" fill="#26222f" stroke={line} />
      <path d="M108 72c5 7 9 11 9 21h26c0-10 4-14 9-21l-9-5h-26z" fill={base} stroke={line} />
      <path d="M113 86c-15 2-29 9-41 22l-25 18 12 30 34-12c-2 24-2 48 3 70l7 28h54l7-28c5-22 5-46 3-70l34 12 12-30-25-18c-12-13-26-20-41-22z" fill={base} stroke={line} />
      <path d="M72 110c-15 3-24 14-32 28l-14 26 18 11 26-24 15-25z" fill={base} stroke={line} />
      <path d="M188 110c15 3 24 14 32 28l14 26-18 11-26-24-15-25z" fill={base} stroke={line} />
      <path d="M45 171 32 209l-12 54 19 6 20-51 10-41z" fill={base} stroke={line} />
      <path d="m215 171 13 38 12 54-19 6-20-51-10-41z" fill={base} stroke={line} />
      <path d="M20 269c-4 7-2 18 7 21l12-10-1-15zM240 269c4 7 2 18-7 21l-12-10 1-15z" fill={base} stroke={line} />
      <path d="M105 248c-8 14-13 26-15 43l-9 28 18 23h62l18-23-9-28c-2-17-7-29-15-43z" fill={base} stroke={line} />
      <path d="M95 333c-5 17-6 36-5 59l10 63h30V333z" fill={base} stroke={line} />
      <path d="M165 333c5 17 6 36 5 59l-10 63h-30V333z" fill={base} stroke={line} />
      <path d="M100 455c-7 16-10 34-9 55l7 62h32v-117z" fill={base} stroke={line} />
      <path d="M160 455c7 16 10 34 9 55l-7 62h-32V455z" fill={base} stroke={line} />
      <path d="M98 574 96 655l-16 39h35l14-38v-82z" fill={base} stroke={line} />
      <path d="M162 574 164 655l16 39h-35l-14-38v-82z" fill={base} stroke={line} />
      <path d="M80 694c-7 4-13 9-16 16h52l-1-16zM180 694c7 4 13 9 16 16h-52l1-16z" fill="#26222f" stroke={line} />
    </g>

    {front ? <g className="anatomy-muscles">
      <path d="M115 78 95 91l-14 19 31 14 18-20z" fill={fill('ombros')} stroke={line} />
      <path d="m145 78 20 13 14 19-31 14-18-20z" fill={fill('ombros')} stroke={line} />
      <path d="M95 91c-14 2-26 10-31 23l16 13 30-5 7-15z" fill={fill('ombros')} stroke={line} />
      <path d="M165 91c14 2 26 10 31 23l-16 13-30-5-7-15z" fill={fill('ombros')} stroke={line} />
      <path d="M111 93c-16-8-35-3-45 12 8 18 25 26 48 22v-22z" fill={fill('peito')} stroke={line} />
      <path d="M149 93c16-8 35-3 45 12-8 18-25 26-48 22v-22z" fill={fill('peito')} stroke={line} />
      <path d="M130 103v28" fill="none" stroke={line} />
      <path d="M79 126c-10 11-12 29-5 43 7 6 17 6 26 0l6-35-11-12z" fill={fill('braços')} stroke={line} />
      <path d="M181 126c10 11 12 29 5 43-7 6-17 6-26 0l-6-35 11-12z" fill={fill('braços')} stroke={line} />
      <path d="M69 165c-8 15-12 32-10 48l18 7 17-45-8-20z" fill={fill('braços')} stroke={line} />
      <path d="M191 165c8 15 12 32 10 48l-18 7-17-45 8-20z" fill={fill('braços')} stroke={line} />
      <path d="M111 132c-1 18-1 35 1 51l-17 5-7-36 7-21z" fill={fill('abdômen')} stroke={line} />
      <path d="M149 132c1 18 1 35-1 51l17 5 7-36-7-21z" fill={fill('abdômen')} stroke={line} />
      <path d="M116 132h12v17h-12zM132 132h12v17h-12zM116 153h12v18h-12zM132 153h12v18h-12zM117 175h11v18h-11zM132 175h11v18h-11z" fill={fill('abdômen')} stroke={line} />
      <path d="M96 184c10 5 21 7 34 7v43h-24l-18-21z" fill={fill('abdômen')} stroke={line} />
      <path d="M164 184c-10 5-21 7-34 7v43h24l18-21z" fill={fill('abdômen')} stroke={line} />
      <path d="M96 232c11 6 22 8 34 8s23-2 34-8l10 16-20 18h-48l-20-18z" fill={fill('abdômen')} stroke={line} />
      <path d="M100 248c-11 18-14 42-11 66l13 41c9 4 18 4 28 0v-99z" fill={fill('pernas')} stroke={line} />
      <path d="M160 248c11 18 14 42 11 66l-13 41c-9 4-18 4-28 0v-99z" fill={fill('pernas')} stroke={line} />
      <path d="M112 249c-4 21-4 43-1 66l7 38h-16l-13-39c-3-24 2-47 10-65z" fill={fill('pernas')} stroke={line} />
      <path d="M148 249c4 21 4 43 1 66l-7 38h16l13-39c3-24-2-47-10-65z" fill={fill('pernas')} stroke={line} />
      <path d="M102 356c-8 20-10 44-6 68l6 48h19l6-116z" fill={fill('pernas')} stroke={line} />
      <path d="M158 356c8 20 10 44 6 68l-6 48h-19l-6-116z" fill={fill('pernas')} stroke={line} />
      <path d="M105 470c-7 24-9 52-5 82l4 25h18l5-107z" fill={fill('pernas')} stroke={line} />
      <path d="M155 470c7 24 9 52 5 82l-4 25h-18l-5-107z" fill={fill('pernas')} stroke={line} />
      <path d="M111 580c-6 28-9 54-8 75l-8 24h19l14-42v-57z" fill={fill('pernas')} stroke={line} />
      <path d="M149 580c6 28 9 54 8 75l8 24h-19l-14-42v-57z" fill={fill('pernas')} stroke={line} />
      <path className="anatomy-detail" d="M130 82v156M130 248v82M130 356v84M130 470v80M104 356h22M156 356h-22" />
    </g> : <g className="anatomy-muscles">
      <path d="M113 77 75 94l20 32 35-23v-19z" fill={fill('costas')} stroke={line} />
      <path d="M147 77 185 94l-20 32-35-23v-19z" fill={fill('costas')} stroke={line} />
      <path d="M75 96c-13 1-24 10-29 22l17 14 28-11-3-16z" fill={fill('ombros')} stroke={line} />
      <path d="M185 96c13 1 24 10 29 22l-17 14-28-11 3-16z" fill={fill('ombros')} stroke={line} />
      <path d="M68 127c-9 10-11 28-4 42 7 5 16 5 24-1l7-34-12-13z" fill={fill('braços')} stroke={line} />
      <path d="M192 127c9 10 11 28 4 42-7 5-16 5-24-1l-7-34 12-13z" fill={fill('braços')} stroke={line} />
      <path d="M59 166c-8 15-12 32-10 48l18 7 17-45-8-20z" fill={fill('braços')} stroke={line} />
      <path d="M201 166c8 15 12 32 10 48l-18 7-17-45 8-20z" fill={fill('braços')} stroke={line} />
      <path d="M130 92 108 113l22 30 22-30z" fill={fill('costas')} stroke={line} />
      <path d="M108 112c-16 12-27 31-28 57 8 18 20 29 37 36l13-58z" fill={fill('costas')} stroke={line} />
      <path d="M152 112c16 12 27 31 28 57-8 18-20 29-37 36l-13-58z" fill={fill('costas')} stroke={line} />
      <path d="M125 140h10v97h-10z" fill={fill('costas')} stroke={line} />
      <path d="M96 204c10 9 21 13 34 13s24-4 34-13l13 28-18 25H101l-18-25z" fill={fill('costas')} stroke={line} />
      <path d="M101 248c-10 19-13 42-10 66l13 41c9 4 18 4 26 0v-99z" fill={fill('glúteos', 'pernas')} stroke={line} />
      <path d="M159 248c10 19 13 42 10 66l-13 41c-9 4-18 4-26 0v-99z" fill={fill('glúteos', 'pernas')} stroke={line} />
      <path d="M113 250c-4 21-4 43-1 66l7 39h-16l-13-40c-3-24 2-47 10-65z" fill={fill('pernas')} stroke={line} />
      <path d="M147 250c4 21 4 43 1 66l-7 39h16l13-40c3-24-2-47-10-65z" fill={fill('pernas')} stroke={line} />
      <path d="M104 356c-8 20-10 44-6 68l6 48h19l6-116z" fill={fill('pernas')} stroke={line} />
      <path d="M156 356c8 20 10 44 6 68l-6 48h-19l-6-116z" fill={fill('pernas')} stroke={line} />
      <path d="M106 470c-7 24-9 52-5 82l4 25h18l5-107z" fill={fill('pernas')} stroke={line} />
      <path d="M154 470c7 24 9 52 5 82l-4 25h-18l-5-107z" fill={fill('pernas')} stroke={line} />
      <path d="M112 580c-6 28-9 54-8 75l-8 24h19l14-42v-57z" fill={fill('pernas')} stroke={line} />
      <path d="M148 580c6 28 9 54 8 75l8 24h-19l-14-42v-57z" fill={fill('pernas')} stroke={line} />
      <path className="anatomy-detail" d="M130 82v155M130 248v83M130 356v84M130 470v80M104 356h22M156 356h-22" />
    </g>}
  </svg>
}

export default function DetailedAnatomyMap({ activeGroups }) {
  return <div className="muscle-map detailed-anatomy-map">
    <div className="muscle-silhouette-grid">
      <div className="muscle-view"><span className="muscle-view-label">FRENTE</span><AnatomyFigure view="front" activeGroups={activeGroups} /></div>
      <div className="muscle-view"><span className="muscle-view-label">COSTAS</span><AnatomyFigure view="back" activeGroups={activeGroups} /></div>
    </div>
    <div className="muscle-anatomy-key"><span><b>Peito</b> · deltoide · bíceps</span><span><b>Abdômen</b> · quadríceps · tibial</span><span><b>Costas</b> · trapézio · dorsais · lombar</span><span><b>Glúteos</b> · posteriores · panturrilha</span></div>
  </div>
}
