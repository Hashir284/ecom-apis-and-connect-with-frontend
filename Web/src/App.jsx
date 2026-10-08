import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './Page/Signup'
import Login from './Page/Login'
import Dashboard from './Page/Dashboard'
import './App.css'
import { useContext } from 'react'
import { UserData } from './Context/Context'
import { useEffect } from 'react'
import api from './Api/api'

function App() {
  
  const { userLoggedin, setUser, setUserLoggedin, user } = useContext(UserData)

  useEffect(() => {
    getUser()
  }, [])
const getUser = async () => {
    try {
      let apiRes  = await api.get('me')
      console.log(apiRes.data.user);
      setUser(apiRes.data.user)
      setUserLoggedin(true)
    } catch (e) {
      setUserLoggedin(false)
      setUser(null)
      console.log(e.response);
      return
    }
  }

  if(userLoggedin === null){
    return null
  }

  if(userLoggedin === true && user != null){
    return <Routes>
        <Route path="/" element={<Navigate to="/Dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='*' element={<Navigate to="/Dashboard" replace />} />
      </Routes>
  }

  if(userLoggedin === false){
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path='*' element={<Navigate to="/login" replace />} />
      </Routes>
  )
}

}

export default App