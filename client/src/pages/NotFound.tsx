import { useNavigate } from 'react-router-dom'

export const NotFound = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-page flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-bold text-zinc-700 mb-4">404</div>
        <div className="text-zinc-400 mb-6">Page not found</div>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">
          Go home
        </button>
      </div>
    </div>
  )
}
