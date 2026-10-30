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
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [resendNotice, setResendNotice] = useState('')
  const [showResendOption, setShowResendOption] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { signUp, verifyEmail, resendVerificationCode, user } = useAuthStore()
  const navigate = useNavigate()

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

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
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
      setVerificationSent(true)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription')
      setShowResendOption(true)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyEmail(formData.email, verificationCode.trim())
      setSuccess(true)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Code invalide ou expiré. Demande un nouveau code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setResendNotice('')
    setLoading(true)
    try {
      await resendVerificationCode(formData.email, formData.fullName, formData.delegation)
      setVerificationSent(true)
      setResendNotice('Un nouveau code vient d’être envoyé.')
    } catch (err: any) {
      setError(err.message || 'Impossible de renvoyer le code pour le moment.')
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
              <p className="text-sm text-green-600">Adresse email vérifiée. Redirection…</p>
            </div>
          )}

          {verificationSent && !success ? (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <p className="text-sm text-gray-600">
                Un code à six chiffres a été envoyé à <strong>{formData.email}</strong>. Saisis-le pour confirmer ton adresse.
              </p>
              {resendNotice && <p className="text-sm text-green-700">{resendNotice}</p>}
              <Input
                type="text"
                name="verificationCode"
                label="Code de vérification"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
              />
              <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                Vérifier mon adresse
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={handleResendCode} isLoading={loading}>
                Renvoyer le code
              </Button>
            </form>
          ) : !success ? (
          <>
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
              placeholder="Minimum 8 caractères"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              helperText="Au moins 8 caractères"
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
          {showResendOption && formData.email && (
            <div className="mt-4 text-center">
              <p className="mb-2 text-sm text-gray-600">
                Si tu avais déjà tenté l’inscription, tu peux demander un nouveau code.
              </p>
              <Button type="button" variant="outline" className="w-full" onClick={handleResendCode} isLoading={loading}>
                Envoyer un code de vérification
              </Button>
            </div>
          )}
          </>
          ) : null}

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
