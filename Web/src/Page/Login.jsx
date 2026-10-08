import React, { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../Api/api'
import { useContext } from 'react'
import { UserData } from '../Context/Context'

const Login = () => {
  const { userLoggedin, setUser, setUserLoggedin, user } = useContext(UserData)
  const email = useRef(null)
  const password = useRef(null)
  const navigate = useNavigate()

  const DataSubmit = async (e) => {
    e.preventDefault()

    if (!email.current.value.trim() || !password.current.value.trim()) {
      alert('Plz! fill all fields')
      return
    }

    try {
      const response = await api.post('login', {
        email: email.current.value,
        password: password.current.value,
      })
      setUser(response.data.user)
      setUserLoggedin(true)
      navigate('/dashboard')
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed!')
      setUserLoggedin(false)
      setUser(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>
        <form onSubmit={DataSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              ref={email}
              placeholder="enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              ref={password}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-200"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login