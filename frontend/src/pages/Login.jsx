import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

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
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-secondary)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 450, width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '48px 40px', boxShadow: 'var(--shadow)' }}
      >
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 700, marginBottom: 8, textAlign: 'center', color: 'var(--text-main)' }}>Bem-vindo de volta</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 40, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>Acesse sua experiência exclusiva</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 48 }}
                placeholder="seu@email.com"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 48 }}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {loading ? 'Processando...' : 'Acessar Conta'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-secondary)' }}>
          Ainda não possui acesso? <Link to="/cadastro" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Solicitar Cadastro</Link>
        </p>
      </motion.div>
    </div>
  );
}