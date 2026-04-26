import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Gift, Users, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('convidado');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !email || !senha) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    setLoading(true);
    const result = await register(nome, email, senha, tipo);
    setLoading(false);
    if (result && result.success) {
      if (tipo === 'dono') {
        window.location.href = '/criar-evento';
      } else {
        window.location.href = '/buscar';
      }
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-secondary)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 550, width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '48px 40px', boxShadow: 'var(--shadow)' }}
      >
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 700, marginBottom: 8, textAlign: 'center', color: 'var(--text-main)' }}>Criar Conta</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 40, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>Escolha sua experiência</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          <button
            type="button"
            onClick={() => setTipo('dono')}
            style={{
              padding: 24,
              background: tipo === 'dono' ? 'var(--primary)' : 'var(--bg-main)',
              border: tipo === 'dono' ? '1px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: 0,
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <Gift size={28} color={tipo === 'dono' ? 'var(--bg-main)' : 'var(--primary)'} style={{ margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 700, color: tipo === 'dono' ? 'var(--bg-main)' : 'var(--text-main)', marginBottom: 4, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Organizador</div>
            <p style={{ fontSize: 11, color: tipo === 'dono' ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
              Vou criar minha lista
            </p>
          </button>
          
          <button
            type="button"
            onClick={() => setTipo('convidado')}
            style={{
              padding: 24,
              background: tipo === 'convidado' ? 'var(--primary)' : 'var(--bg-main)',
              border: tipo === 'convidado' ? '1px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: 0,
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <Users size={28} color={tipo === 'convidado' ? 'var(--bg-main)' : 'var(--primary)'} style={{ margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 700, color: tipo === 'convidado' ? 'var(--bg-main)' : 'var(--text-main)', marginBottom: 4, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Convidado</div>
            <p style={{ fontSize: 11, color: tipo === 'convidado' ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
              Vou presentear alguém
            </p>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 48 }}
                placeholder="Seu nome"
              />
            </div>
          </div>
          
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
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 48 }}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {loading ? 'Processando...' : 'Finalizar Cadastro'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-secondary)' }}>
          Já possui acesso? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Fazer Login</Link>
        </p>
      </motion.div>
    </div>
  );
}