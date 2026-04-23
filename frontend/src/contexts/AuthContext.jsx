import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        api.defaults.headers.Authorization = `Bearer ${token}`;
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao parsear user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const register = async (nome, email, senha, tipo) => {
    try {
      const response = await api.post('/auth/registro', { 
        nome, 
        email, 
        senha,
        tipo
      });
      
      const { user: userData, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(userData);
      
      toast.success('Cadastro realizado com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error(error.response?.data?.error || 'Erro ao cadastrar');
      return { success: false };
    }
  };

  const login = async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { user: userData, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(userData);
      
      toast.success('Bem-vindo de volta!');
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error(error.response?.data?.error || 'Erro ao fazer login');
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.Authorization;
    setUser(null);
    toast.success('Logout realizado');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};