import { login } from '../actions'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <h1 className="text-4xl mb-2">🔐</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Akses Terbatas</h2>
        
        <form action={login} className="space-y-4">
          <div>
            <input 
              name="pin" 
              type="password" 
              placeholder="Masukkan PIN Rahasia" 
              required 
              className="w-full text-center text-2xl tracking-widest p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
          >
            BUKA GEMBOK
          </button>
        </form>
        
        <p className="text-gray-400 text-xs mt-6">EcoLoop V2 Security System</p>
      </div>
    </div>
  )
}