import React from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Library } from './components/Library';

export const App: React.FC = () => {
  const { token } = useAuth();
  
  return (
    <div>
      {token ? <Library /> : <Login />}
    </div>
  );
};