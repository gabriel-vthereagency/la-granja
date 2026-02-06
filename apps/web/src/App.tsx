import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { HistorialPage } from './pages/HistorialPage'
import { SeasonPage } from './pages/SeasonPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { JugadoresPage } from './pages/JugadoresPage'
import { PlayerProfilePage } from './pages/PlayerProfilePage'
import { HallOfFamePage } from './pages/HallOfFamePage'
import { EstadisticasPage } from './pages/EstadisticasPage'
import { ReglamentoPage } from './pages/ReglamentoPage'
import { HistoriaPage } from './pages/HistoriaPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/historial" element={<HistorialPage />} />
          <Route path="/historial/:seasonId" element={<SeasonPage />} />
          <Route path="/historial/:seasonId/:eventId" element={<EventDetailPage />} />
          <Route path="/jugadores" element={<JugadoresPage />} />
          <Route path="/jugadores/:playerId" element={<PlayerProfilePage />} />
          <Route path="/hall-of-fame" element={<HallOfFamePage />} />
          <Route path="/estadisticas" element={<EstadisticasPage />} />
          <Route path="/reglamento" element={<ReglamentoPage />} />
          <Route path="/historia" element={<HistoriaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
