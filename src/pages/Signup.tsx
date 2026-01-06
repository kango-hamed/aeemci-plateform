import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const DELEGATIONS = [
  'Culturelle',
  'Organisationnelle',
  'Bureau Exécutif',
  'Cellule Informatique',
  'Cellule Communication',
  'Autre'
]

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    delegation: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { signUp, user, initialize } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    if (!formData.delegation) {
      setError('Veuillez sélectionner une délégation')
      setLoading(false)
      return
    }

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.delegation
      )
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-3xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AEEMCI</h1>
          <p className="text-gray-600 mt-2">Créez votre compte</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Inscription</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">
                Inscription réussie ! Vérifiez votre email pour confirmer votre compte.
                Redirection...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="fullName"
              label="Nom complet"
              placeholder="Ex: Kouassi Jean"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="votre.email@esatic.edu.ci"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Délégation <span className="text-red-500">*</span>
              </label>
              <select
                name="delegation"
                value={formData.delegation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Sélectionnez votre délégation</option>
                {DELEGATIONS.map(del => (
                  <option key={del} value={del}>{del}</option>
                ))}
              </select>
            </div>

            <Input
              type="password"
              name="password"
              label="Mot de passe"
              placeholder="Minimum 6 caractères"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              helperText="Au moins 6 caractères"
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loading}
              disabled={success}
            >
              S'inscrire
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-primary-500 font-medium hover:text-primary-600">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Section AEEMCI - ESATIC © 2025
        </p>
      </div>
    </div>
  )
}
