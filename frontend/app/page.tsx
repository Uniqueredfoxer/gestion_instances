"use client";

import { SubmitEventHandler, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    mdp: ''
  })
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);

  const handleSubmit: SubmitEventHandler = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    const { email, mdp } = formData;
    
    if (!email || !mdp) {
      setError("Tous les champs sont requis.");
      setIsLoading(false);
      return;
    }

  try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mdp })
      });
      
      const apiResponse = await response.json();    
      if (!response.ok) {
        setError(apiResponse.error ?? "Échec de la connexion.");
        setIsLoading(false);
        return;
      }
      const {token, data:user} = apiResponse
      console.log('token: ', token,'\n user:', user)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user);
      console.log(apiResponse)
      setSuccessMessage(`Bienvenue ${user?.prenom || ''} ! Redirection en cours...`);
      setTimeout(() => {
      if (user) {
          router.push(user.role_dir);
      }
      }, 1500);

    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Veuillez réessayer.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  }

  const handleCloseModal = () => {
    setShowLogin(false);
    setError('');
    setSuccessMessage('');
    setFormData({ email: '', mdp: '' });
  }

  return (
    <div className="relative min-h-screen text-white">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40)",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Instances Manager
        </h1>

        <p className="mt-3 text-white/80 max-w-md">
          Plateforme de gestion des instances, documents et utilisateurs
        </p>

        <button
          onClick={() => setShowLogin(true)}
          className="mt-8 rounded-lg bg-white px-6 py-3 text-black font-medium hover:bg-white/90 transition cursor-pointer"
        >
          Ouvrir mon espace de travail
        </button>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
          onClick={handleCloseModal}
        >
          <div 
            className="w-full max-w-md rounded-xl bg-white p-6 text-black shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-center">
              Connexion
            </h2>

            {/* ✅ Success Message */}
            {successMessage && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <p className="text-sm text-green-700 font-medium">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading || !!successMessage}
                required
              />

              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Mot de passe"
                type="password"
                name="mdp"
                value={formData.mdp}
                onChange={handleInputChange}
                disabled={isLoading || !!successMessage}
                required
              />

              <button
                type="submit"
                disabled={isLoading || !!successMessage}
                className={`
                  w-full rounded-lg py-2.5 text-white font-medium transition
                  ${isLoading || successMessage 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary-600 hover:bg-primary-700 cursor-pointer'
                  }
                `}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : successMessage ? (
                  "Redirection..."
                ) : (
                  "Se Connecter"
                )}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={handleCloseModal}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
                disabled={isLoading}
              >
                Fermer
              </button>
              <a href="#" className="text-sm text-primary-600 hover:underline">
                Mot de passe oublié ?
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}