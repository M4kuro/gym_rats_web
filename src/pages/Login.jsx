import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider } from 'firebase/auth';


function Login() {
  const [input, setInput] = useState(""); // Can be email or username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateInput = (input) => {
    // Check if it's an email format
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(input) || input.length >= 3; 
  };

  // Normal login
const handleLogin = async (e) => {
    e.preventDefault();
  setError("");

  if (!validateInput(input)) {
    setError("Invalid email format");
    return;
  }

    try {
    setLoading(true);
    await signInWithEmailAndPassword(auth, input, password);
    setLoading(false);
    navigate("/HomePage"); // Change this to home page (SAM)
  } catch (error) {
    setLoading(false);
    setError(error.message);
  }
  };

  // Google login -----> Saturday  03/22 prabh implemented in class
  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      setLoading(false);
      navigate("/HomePage"); // Change this to home page (SAM)
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  // Bones + Style
  return (
  <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
    <img className="mx-auto h-80 w-auto" src="/logo.png" alt="Your Company"/>
    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-red-600">Welcome to Gym Rats</h2>
  </div>

  <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form onSubmit={handleLogin} className="space-y-6" action="#" method="POST">
      <div>
        <label for="email" className="block text-sm/6 font-medium text-red-600">Email address</label>
        <div className="mt-2">
              <input type="text" name="email" id="email" autocomplete="email"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
                // input box styling
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600 sm:text-sm/6" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label for="password" className="block text-sm/6 font-medium text-red-600">Password</label>
          <div className="text-sm">
            <a href="#" className="font-semibold text-red-600 hover:text-red-300">Forgot password?</a>
          </div>
        </div>
        <div className="mt-2">
              <input type="password" name="password" id="password" autocomplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                // input box styling
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600 sm:text-sm/6" />
        </div>
      </div>

          
          <div>
            <button type="submit"
              // sign in Styling
              className="w-full text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-500 dark:hover:bg-red-700 dark:focus:ring-red-800">Login</button>
          </div>
          



        </form>
        
          <button onClick={handleGoogleLogin} type="button"
            // google button styling
            className="w-full text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex justify-center items-center dark:focus:ring-[#4285F4]/55 mt-5 me-2 mb-2">
            
            <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
              <path fill-rule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clip-rule="evenodd"/>
            </svg>
            
            Sign in with Google
          
        </button>  

    <p className="mt-10 text-center text-sm/6 text-gray-500"> Not a member?
      <Link to="/Signup" className="font-semibold text-red-600 hover:text-red-300"> Sign up</Link>
    </p>
  </div>
</div>
  );
}

export default Login;
