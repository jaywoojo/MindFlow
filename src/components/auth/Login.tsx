import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// Import the logo and preview image
import MindFlowLogo from '../../assets/mindflow-logo-thicker.png';
import mindflow_4_wide from '../../assets/mindflow_4_wide.png';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginWithGoogle } = useAuth();
  
  async function handleGoogleLogin() {
    setError('');
    
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-100">
      {/* Split screen layout */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left side - Login content */}
        <div className="w-full md:w-1/2 flex flex-col">
          {/* Logo at the top of left side */}
          <div className="flex items-center justify-center mt-4 mb-6">
            <img 
              src={MindFlowLogo} 
              alt="MindFlow Logo" 
              className="h-12 w-12 object-contain"
            />
            <h1 className="ml-2 text-2xl font-bold text-gray-800">MindFlow</h1>
          </div>
          
          {/* Login content centered in remaining space */}
          <div className="flex-grow flex items-center justify-center">
            {/* Content container with blob background */}
            <div className="relative w-full max-w-md px-4">
              {/* Blob SVG Background */}
              <svg 
                className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-52/100 -translate-y-1/2 w-[250%] h-[250%] opacity-90" 
                viewBox="0 0 500 500" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: 'rgb(226, 232, 240)'}}></stop>
                    <stop offset="100%" style={{stopColor: 'rgb(98, 116, 142)'}}></stop>
                  </linearGradient>
                </defs>
                <path 
                  d="M455.5,319.5Q442,389,378.5,419Q315,449,259,421.5Q203,394,151,376.5Q99,359,63.5,304.5Q28,250,66.5,197.5Q105,145,151,116Q197,87,253.5,76.5Q310,66,354.5,104Q399,142,434,196Q469,250,455.5,319.5Z" 
                  fill="url(#gradient)"
                ></path>
              </svg>

              {/* Content group - all positioned on the blob as one unit */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Tagline and subline - separate from login card */}
                <div className="text-center mb-6 w-full">
                  <h2 className="text-4xl font-semibold text-gray-800 mb-2">
                    Productivity,
                    <br />
                    visualized
                  </h2>
                  <p className="text-xl text-gray-800 mt-6">Graph-based task system that brings clarity to your chaos</p>
                </div>
                
                {/* Login Card Content - separate but aligned with tagline/subline */}
                <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-10 shadow-2xl w-full">
                  {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center mb-6">
                      {error}
                    </div>
                  )}
                  
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                    </svg>
                    <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Creator Attribution at the Bottom of left side */}
          <div className="pb-6 text-center">
            <p className="text-s text-slate-700 opacity-70 hover:opacity-100 transition-opacity duration-300">
              Created by <a 
                href="https://github.com/jaywoojo" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Jay Jo
              </a>
            </p>
          </div>
        </div>
        
        {/* Right side - Static image showcase */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 hidden md:flex bg-slate-200">
          <div className="relative w-full max-w-2xl flex justify-center items-center">
            {/* Static image */}
            <img 
              src={mindflow_4_wide} 
              alt="MindFlow Preview" 
              className="w-full h-auto max-w-[90%] max-h-[80vh] object-contain rounded-lg border border-slate-200 shadow-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;