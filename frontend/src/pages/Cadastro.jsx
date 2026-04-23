import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Gift, Users } from 'lucide-react';
import toast from 'react-hot-toast';

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
      // Redirecionar baseado no tipo
      if (tipo === 'dono') {
        window.location.href = '/criar-evento';
      } else {
        window.location.href = '/buscar';
      }
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 500, width: '100%', background: 'white', borderRadius: 24, padding: 40, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>Criar conta</h2>
        <p style={{ color: '#6e6e73', textAlign: 'center', marginBottom: 32 }}>Escolha como você vai usar o site</p>
        
        {/* Opções de tipo de usuário */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          <button
            type="button"
            onClick={() => setTipo('dono')}
            style={{
              padding: 20,
              background: tipo === 'dono' ? '#0071e3' : 'white',
              border: tipo === 'dono' ? '2px solid #0071e3' : '2px solid #e5e5e7',
              borderRadius: 16,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Gift size={28} color={tipo === 'dono' ? 'white' : '#0071e3'} style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, color: tipo === 'dono' ? 'white' : '#1d1d1f', marginBottom: 4 }}>Sou organizador</div>
            <p style={{ fontSize: 12, color: tipo === 'dono' ? 'rgba(255,255,255,0.8)' : '#6e6e73' }}>
              Vou criar minha lista de presentes
            </p>
          </button>
          
          <button
            type="button"
            onClick={() => setTipo('convidado')}
            style={{
              padding: 20,
              background: tipo === 'convidado' ? '#0071e3' : 'white',
              border: tipo === 'convidado' ? '2px solid #0071e3' : '2px solid #e5e5e7',
              borderRadius: 16,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Users size={28} color={tipo === 'convidado' ? 'white' : '#0071e3'} style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, color: tipo === 'convidado' ? 'white' : '#1d1d1f', marginBottom: 4 }}>Sou convidado</div>
            <p style={{ fontSize: 12, color: tipo === 'convidado' ? 'rgba(255,255,255,0.8)' : '#6e6e73' }}>
              Vou escolher presentes em uma lista
            </p>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Nome completo</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8e8e93' }} />
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 40px', border: '1px solid #d2d2d6', borderRadius: 12, fontSize: 16 }}
                placeholder="Seu nome"
              />
            </div>
          </div>
          
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
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 40px', border: '1px solid #d2d2d6', borderRadius: 12, fontSize: 16 }}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>
          
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#0071e3', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6e6e73' }}>
          Já tem conta? <Link to="/login" style={{ color: '#0071e3', textDecoration: 'none' }}>Faça login</Link>
        </p>
      </div>
    </div>
  );
}