import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Gift } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function BuscarLista() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const buscarLista = async () => {
    if (!codigo.trim()) {
      toast.error('Digite o código da lista');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get(`/eventos/buscar/${codigo}`);
      const evento = response.data;
      // Navegar para a página da lista com os dados do evento
      navigate(`/lista/${codigo}`, { state: { evento } });
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Lista não encontrada. Verifique o código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 500, width: '100%', background: 'var(--bg-main)', borderRadius: 24, padding: 48, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
        <div style={{ width: 60, height: 60, background: 'var(--primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Search size={30} color="var(--text-on-primary)" />
        </div>
        
        <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8, textAlign: 'center', color: 'var(--text-main)' }}>Buscar lista</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32 }}>Digite o código que você recebeu</p>
        
        <input
          type="text"
          placeholder="Ex: ABC12345"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          style={{ width: '100%', padding: '16px', textAlign: 'center', fontSize: 20, letterSpacing: 3, border: '2px solid var(--border-subtle)', borderRadius: 12, marginBottom: 24, fontFamily: 'monospace', background: 'var(--input-bg)', color: 'var(--text-main)' }}
          maxLength={8}
          autoFocus
        />
        
        <button 
          onClick={buscarLista} 
          disabled={loading} 
          style={{ width: '100%', padding: '14px', background: 'var(--primary)', color: 'var(--text-on-primary)', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
        >
          {loading ? 'Buscando...' : 'Ver lista de presentes'}
        </button>
        
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Não tem um código? <br />
            O código é fornecido pelo organizador do evento
          </p>
        </div>
      </div>
    </div>
  );
}