import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './Page/Signup'
import Login from './Page/Login'
import Dashboard from './Page/Dashboard'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App