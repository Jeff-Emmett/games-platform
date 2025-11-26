import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import RequestsPage from './pages/RequestsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/game/:id" element={<GamePage />} />
        <Route path="/requests" element={<RequestsPage />} />
      </Route>
    </Routes>
  )
}

export default App
