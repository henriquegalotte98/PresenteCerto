import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result && result.success) {
      // Verificar se tinha um produto pendente
      const pending = localStorage.getItem('pending_product');
      if (pending) {
        const produto = JSON.parse(pending);
        localStorage.removeItem('pending_product');
        navigate(`/lista/${produto.codigo}`);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 400, width: '100%', background: 'white', borderRadius: 24, padding: 40, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>Bem-vindo</h2>
        <p style={{ color: '#6e6e73', textAlign: 'center', marginBottom: 32 }}>Faça login para continuar</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8e8e93' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 40px', border: '1px solid #d2d2d6', borderRadius: 12, fontSize: 16 }}
                placeholder="seu@email.com"
              />
            </div>
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8e8e93' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 40px', border: '1px solid #d2d2d6', borderRadius: 12, fontSize: 16 }}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#0071e3', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6e6e73' }}>
          Não tem conta? <Link to="/cadastro" style={{ color: '#0071e3', textDecoration: 'none' }}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}