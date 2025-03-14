import React, { useState } from 'react';
import {Link, useNavigate } from 'react-router-dom';
function Login() {
  const [input, setInput] = useState(""); // Can be email or username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateInput = (input) => {
    // Check if it's an email format
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(input) || input.length >= 3; // Accept usernames with at least 3 characters
  };

const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!validateInput(input)) {
      setError("Enter a valid email or username.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Simulate a login API request
    setTimeout(() => {
      navigate("/home"); // Redirect to home page
    }, 1500);
  };

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
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
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
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
        </div>
      </div>

      <div>
        <button type="submit" className="flex w-full justify-center rounded-md bg-red-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-red-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">Sign in</button>
      </div>
    </form>

    <p className="mt-10 text-center text-sm/6 text-gray-500"> Not a member?
      <Link to="/Signup" className="font-semibold text-red-600 hover:text-red-300"> Sign up</Link>
    </p>
  </div>
</div>
  );
}

export default Login;
