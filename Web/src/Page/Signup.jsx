import React, { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../Api/api'

const Signup = () => {
  const first_name = useRef(null)
  const last_name = useRef(null)
  const email = useRef(null)
  const password = useRef(null)
  const navigate = useNavigate()

  const DataSubmit = async (e) => {
    e.preventDefault()

    if (
      !first_name.current.value.trim() ||
      !last_name.current.value.trim() ||
      !email.current.value.trim() ||
      !password.current.value.trim()
    ) {
      alert('Plz! fill all fields')
      return
    }

    try {
      const data = await api.post('signup', {
        first_name: first_name.current.value,
        last_name: last_name.current.value,
        email: email.current.value,
        password: password.current.value,
      })
      alert(data.data.message)
      navigate('/login')
    } catch (error) {
      alert(error.response?.data?.message || 'Signup failed!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Account
        </h2>
        <form onSubmit={DataSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                ref={first_name}
                placeholder="Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                ref={last_name}
                placeholder="Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              ref={email}
              placeholder="Email"
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
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup