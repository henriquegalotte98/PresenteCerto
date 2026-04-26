import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Copy, Gift, Plus } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function MeusEventos() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      carregarEventos();
    } else {
      window.location.href = '/login';
    }
  }, [user]);

  const carregarEventos = async () => {
    try {
      const response = await api.get('/eventos/meus-eventos');
      setEventos(response.data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    toast.success('Código copiado!');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 600, marginBottom: 8, color: 'var(--text-main)' }}>Meus Eventos</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie todas as suas listas de presentes</p>
        </div>
        <Link to="/criar-evento" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--primary)', color: 'var(--text-on-primary)', textDecoration: 'none', borderRadius: 12, fontWeight: 500 }}>
          <Plus size={18} />
          Novo evento
        </Link>
      </div>

      {eventos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, background: 'var(--bg-main)', borderRadius: 24, border: '1px solid var(--border)' }}>
          <Gift size={64} color="var(--border-subtle)" style={{ marginBottom: 20 }} />
          <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>Nenhum evento criado</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Crie sua primeira lista de presentes</p>
          <Link to="/criar-evento" style={{ padding: '12px 24px', background: 'var(--primary)', color: 'var(--text-on-primary)', textDecoration: 'none', borderRadius: 12, display: 'inline-block' }}>Criar meu primeiro evento</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {eventos.map((evento) => (
            <div key={evento.id_evento} style={{ background: 'var(--bg-main)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{evento.titulo}</h3>
                  {evento.descricao && (
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>{evento.descricao}</p>
                  )}
                  
                  <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={14} /> {new Date(evento.data_evento).toLocaleDateString('pt-BR')}
                    </span>
                    {evento.local && (
                      <span style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} /> {evento.local}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <code style={{ background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: 8, fontSize: 14, fontFamily: 'monospace', letterSpacing: 1, color: 'var(--text-main)' }}>
                      {evento.codigo}
                    </code>
                    <button onClick={() => copiarCodigo(evento.codigo)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 6 }}>
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/painel-dono/${evento.id_evento}`} style={{ padding: '8px 20px', background: 'var(--primary)', color: 'var(--text-on-primary)', textDecoration: 'none', borderRadius: 8 }}>
                    Gerenciar
                  </Link>
                  <Link to={`/lista/${evento.codigo}`} style={{ padding: '8px 20px', background: 'transparent', color: 'var(--primary)', textDecoration: 'none', borderRadius: 8, border: '1px solid var(--primary)' }}>
                    Visualizar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}