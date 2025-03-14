import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassW, setConfirmPassW] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
    const navigate = useNavigate();
    
    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSignUp = (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
      }
      if (password!== confirmPassW) {
      setError("Passwords do not match");
      return;
      }


    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1500);
  };


    return (
        <section className="">
  <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-white-900 dark:text-white">
        <img className="mx-auto h-60 w-auto" src="/logo.png" alt="logo"/>   
                </a>
                <h1 className="mb-4 text-2xl font-bold text-red-600">Welcome to Gym Rats</h1>
                
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:border-red-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        
              <h1 className="text-xl font-bold leading-tight tracking-tight text-red-600 md:text-2xl ">
                  Create an account
              </h1>
              <form onSubmit={handleSignUp} className="space-y-4 md:space-y-6" action="#">
                  <div>
                      <label for="email" className="block mb-2 text-sm font-medium text-red-600">Your email</label>
                                <input type="text" name="email" id="email"
                                    
                                    className="border text-m rounded-lg block w-full p-2.5 border-red-600" 
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    required />
                  </div>
                  <div>
                      <label for="password" className="block mb-2 text-sm font-medium text-red-600">Password</label>
                                <input type="password" name="password" id="password" placeholder="" className="border text-m rounded-lg block w-full p-2.5 border-red-600"
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    required/>
                  </div>
                  <div>
                      <label for="confirm-password" className="block mb-2 text-sm font-medium text-red-600">Confirm password</label>
                                <input type="password" name="confirm-password" id="confirm-password" placeholder="" className="border text-m rounded-lg block w-full p-2.5 border-red-600" 
                                    
                                    onChange={(e) => setConfirmPassW(e.target.value)}
                                    value={confirmPassW}
                                    required />
                  </div>
                  <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input id="terms" aria-describedby="terms" type="checkbox" className="w-4 h-4 border border-gray-900 rounded focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-red-600 dark:ring-offset-gray-800" required/>
                      </div>
                      <div className="ml-3 text-sm">
                        <label for="terms" className="font-light text-gray-500 dark:text-gray-700">I accept the <a className="font-medium text-red-600 hover:underline dark:text-red-500" href="#">Terms and Conditions</a></label>
                      </div>
                  </div>
                  <button type="submit" className="w-full text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-500 dark:hover:bg-red-700 dark:focus:ring-red-800">Create an account</button>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-700">
                      Already have an account? <Link to="/" className="font-medium text-red-600 hover:underline dark:text-red-500">Login</Link>
                  </p>
              </form>
          </div>
      </div>
  </div>
</section>
   
    );
}

export default Signup;