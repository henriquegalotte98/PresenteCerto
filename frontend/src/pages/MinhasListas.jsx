import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, Copy, Gift } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function MinhasListas() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user || !user.is_admin) return <Navigate to="/" />;

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    try {
      const res = await api.get('/eventos/meus-eventos');
      setEventos(res.data);
    } catch (error) {
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    toast.success('Código copiado!');
  };

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 600, marginBottom: 8 }}>Minhas Listas</h1>
          <p style={{ color: '#6e6e73' }}>Gerencie todos os seus eventos</p>
        </div>
        <Link to="/criar-evento" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} />
          Nova lista
        </Link>
      </div>

      {eventos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, background: 'white', borderRadius: 24 }}>
          <Gift size={64} color="#c6c6c8" style={{ marginBottom: 20 }} />
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>Nenhuma lista criada</h3>
          <p style={{ color: '#6e6e73', marginBottom: 24 }}>Crie sua primeira lista de presentes</p>
          <Link to="/criar-evento" className="btn-primary">Criar lista</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {eventos.map(evento => (
            <div key={evento.id_evento} style={{ background: 'white', borderRadius: 16, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{evento.titulo}</h3>
                <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, color: '#6e6e73', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={14} /> {new Date(evento.data_evento).toLocaleDateString('pt-BR')}
                  </span>
                  {evento.local && (
                    <span style={{ fontSize: 14, color: '#6e6e73', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={14} /> {evento.local}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{ background: '#f5f5f7', padding: '4px 8px', borderRadius: 8, fontSize: 14 }}>{evento.codigo}</code>
                  <button onClick={() => copiarCodigo(evento.codigo)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0071e3' }}>Copiar</button>
                </div>
              </div>
              <Link to={`/painel-dono/${evento.id_evento}`} className="btn-secondary">Gerenciar</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}