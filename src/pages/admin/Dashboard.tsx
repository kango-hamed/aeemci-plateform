import { supabase } from '@/lib/supabase'
import { FileText, Image, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Stats {
  totalUsers: number
  totalTemplates: number
  totalVisuals: number
  visualsThisMonth: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTemplates: 0,
    totalVisuals: 0,
    visualsThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Count users
      const { count: usersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Count templates
      const { count: templatesCount } = await supabase
        .from('templates')
        .select('*', { count: 'exact', head: true })

      // Count total visuals
      const { count: visualsCount } = await supabase
        .from('visuels_generes')
        .select('*', { count: 'exact', head: true })

      // Count visuals this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count: monthVisualsCount } = await supabase
        .from('visuels_generes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())

      setStats({
        totalUsers: usersCount || 0,
        totalTemplates: templatesCount || 0,
        totalVisuals: visualsCount || 0,
        visualsThisMonth: monthVisualsCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Utilisateurs',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Templates',
      value: stats.totalTemplates,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'Visuels Générés',
      value: stats.totalVisuals,
      icon: Image,
      color: 'bg-purple-500',
    },
    {
      title: 'Ce Mois-ci',
      value: stats.visualsThisMonth,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme AEEMCI</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className="bg-white rounded-lg shadow p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-8 bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bienvenue dans l'interface admin</h2>
        <p className="text-gray-600 mb-4">
          Utilisez le menu de gauche pour naviguer entre les différentes sections :
        </p>
        <ul className="space-y-2 text-gray-600">
          <li>• <strong>Templates</strong> : Gérer les templates d'affiches</li>
          <li>• <strong>Types de Contenus</strong> : Organiser les catégories</li>
          <li>• <strong>Statistiques</strong> : Analyser l'utilisation de la plateforme</li>
        </ul>
      </div>
    </div>
  )
}
