import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, FileText, Link as LinkIcon, Gift, Sparkles } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CriarEvento() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_evento: '',
    local: '',
    mapa_link: ''
  });

  // Se não estiver logado, redireciona para login
  if (!user) {
    window.location.href = '/login';
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.data_evento) {
      toast.error('Preencha o título e a data do evento');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/eventos', formData);
      const { evento, codigo } = response.data;
      
      toast.success(`Evento criado! Código: ${codigo}`);
      
      // Redirecionar usando window.location
      window.location.href = `/meus-eventos`;
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao criar evento: ' + (error.response?.data?.error || error.message));
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ width: 70, height: 70, background: 'var(--primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Sparkles size={35} color="var(--text-on-primary)" />
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 600, marginBottom: 8, color: 'var(--text-main)' }}>Criar meu evento</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Olá, {user.nome}! Preencha os dados do seu evento
        </p>
      </div>
      
      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-main)', borderRadius: 24, padding: 40, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-main)' }}>
            <Gift size={16} style={{ display: 'inline', marginRight: 6 }} />
            Título do evento *
          </label>
          <input
            type="text"
            required
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-subtle)', borderRadius: 12, fontSize: 16, background: 'var(--input-bg)', color: 'var(--text-main)' }}
            placeholder="Ex: Casamento João & Maria"
          />
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-main)' }}>
            <FileText size={16} style={{ display: 'inline', marginRight: 6 }} />
            Descrição
          </label>
          <textarea
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-subtle)', borderRadius: 12, fontSize: 16, fontFamily: 'inherit', background: 'var(--input-bg)', color: 'var(--text-main)' }}
            rows="3"
            placeholder="Detalhes sobre o evento..."
          />
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-main)' }}>
            <Calendar size={16} style={{ display: 'inline', marginRight: 6 }} />
            Data do evento *
          </label>
          <input
            type="date"
            required
            value={formData.data_evento}
            onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-subtle)', borderRadius: 12, fontSize: 16, background: 'var(--input-bg)', color: 'var(--text-main)' }}
          />
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-main)' }}>
            <MapPin size={16} style={{ display: 'inline', marginRight: 6 }} />
            Local
          </label>
          <input
            type="text"
            value={formData.local}
            onChange={(e) => setFormData({ ...formData, local: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-subtle)', borderRadius: 12, fontSize: 16, background: 'var(--input-bg)', color: 'var(--text-main)' }}
            placeholder="Endereço completo do evento"
          />
        </div>
        
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-main)' }}>
            <LinkIcon size={16} style={{ display: 'inline', marginRight: 6 }} />
            Link do mapa (Google Maps)
          </label>
          <input
            type="url"
            value={formData.mapa_link}
            onChange={(e) => setFormData({ ...formData, mapa_link: e.target.value })}
            style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-subtle)', borderRadius: 12, fontSize: 16, background: 'var(--input-bg)', color: 'var(--text-main)' }}
            placeholder="https://maps.google.com/..."
          />
        </div>
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'var(--primary)', color: 'var(--text-on-primary)', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Criando...' : 'Criar minha lista de presentes'}
        </button>
      </form>
    </div>
  );
}