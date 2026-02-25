import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const Signup = () => {
    const [businessName, setBusinessName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
        await signup(businessName, email, password);
        navigate('/login');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">F</span>
              </div>
              <h1 className="text-2xl font-bold text-dark">Create an account</h1>
              <p className="text-gray-500 mt-2">Start managing your business professionally.</p>
          </div>
  
          {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
                  {error}
              </div>
          )}
  
          <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Aisha's Fashion Hub"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                      type="password"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                  />
              </div>
              
              <Button type="submit" className="w-full justify-center" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create account'}
              </Button>
          </form>
  
          <p className="text-center mt-6 text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
              </Link>
          </p>
        </Card>
      </div>
    );
  };

export default Signup;
