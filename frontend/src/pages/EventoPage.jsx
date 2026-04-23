import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { MapPin, Calendar, User, Search } from 'lucide-react';
import api from '../services/api';
import CardProdutoConvidado from '../components/CardProdutoConvidado';
import toast from 'react-hot-toast';

export default function EventoPage() {
  const { codigo } = useParams();
  const location = useLocation();
  const [evento, setEvento] = useState(location.state?.evento || null);
  const [produtos, setProdutos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!evento) {
      carregarEvento();
    } else {
      carregarProdutos();
    }
  }, [codigo]);

  useEffect(() => {
    filtrarProdutos();
  }, [search, filter, produtos]);

  const carregarEvento = async () => {
    try {
      const res = await api.get(`/eventos/buscar/${codigo}`);
      setEvento(res.data);
      carregarProdutos(res.data.id_evento);
    } catch (error) {
      toast.error('Evento não encontrado');
    }
  };

  const carregarProdutos = async (idEvento = evento?.id_evento) => {
    if (!idEvento) return;
    
    try {
      const res = await api.get(`/produtos/evento/${idEvento}`);
      setProdutos(res.data);
      setFiltered(res.data);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const filtrarProdutos = () => {
    let result = [...produtos];
    
    if (search) {
      result = result.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));
    }
    
    if (filter === 'available') {
      result = result.filter(p => !p.comprado);
    } else if (filter === 'purchased') {
      result = result.filter(p => p.comprado);
    }
    
    setFiltered(result);
  };

  if (!evento) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header do Evento */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e5e7', padding: '40px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: 36, fontWeight: 600, marginBottom: 16 }}>{evento.titulo}</h1>
          <p style={{ color: '#6e6e73', marginBottom: 24 }}>{evento.descricao}</p>
          
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} color="#0071e3" />
              <span>{new Date(evento.data_evento).toLocaleDateString('pt-BR')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color="#0071e3" />
              <span>{evento.local}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} color="#0071e3" />
              <span>Lista de {evento.dono_nome}</span>
            </div>
          </div>
          
          {evento.mapa_link && (
            <a href={evento.mapa_link} target="_blank" rel="noopener noreferrer" style={{ marginTop: 16, display: 'inline-block', color: '#0071e3', textDecoration: 'none' }}>
              Ver localização no mapa →
            </a>
          )}
        </div>
      </div>
      
      {/* Lista de Produtos */}
      <div className="container" style={{ padding: '48px 20px' }}>
        <div style={{ maxWidth: 400, margin: '0 auto 32px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8e8e93' }} />
            <input
              type="text"
              placeholder="Buscar presente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 48 }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
          <button onClick={() => setFilter('all')} className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}>Todos</button>
          <button onClick={() => setFilter('available')} className={filter === 'available' ? 'btn-primary' : 'btn-secondary'}>Disponíveis</button>
          <button onClick={() => setFilter('purchased')} className={filter === 'purchased' ? 'btn-primary' : 'btn-secondary'}>Já comprados</button>
        </div>
        
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <p style={{ color: '#8e8e93' }}>Nenhum presente encontrado</p>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map(produto => (
              <CardProdutoConvidado 
                key={produto.id_produto} 
                produto={produto} 
                idEvento={evento.id_evento}
                onUpdate={() => carregarProdutos(evento.id_evento)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}