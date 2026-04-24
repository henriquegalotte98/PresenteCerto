import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { ShoppingBag, CheckCircle, Clock, Gift } from 'lucide-react';
import api, { BASE_URL, formatImageUrl } from '../services/api';
import toast from 'react-hot-toast';

export default function MeusPresentes() {
  const { user } = useAuth();
  const [presentes, setPresentes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o modal de confirmação
  const [showModal, setShowModal] = useState(false);
  const [presenteSelecionado, setPresenteSelecionado] = useState(null);
  const [comprovante, setComprovante] = useState(null);
  const [notaFiscal, setNotaFiscal] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (user) {
      carregarPresentes();
    }
  }, [user]);

  const carregarPresentes = async () => {
    try {
      const response = await api.get(`/convidados/meus-presentes/${user.email}`);
      setPresentes(response.data);
    } catch (error) {
      toast.error('Erro ao carregar seus presentes');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async () => {
    if (!notaFiscal && !comprovante) {
      toast.error('Adicione a nota fiscal ou comprovante');
      return;
    }
    
    setConfirming(true);
    const formData = new FormData();
    formData.append('nota_fiscal', notaFiscal);
    formData.append('email', user.email);
    if (comprovante) formData.append('comprovante', comprovante);
    
    try {
      await api.post(`/convidados/confirmar/${presenteSelecionado.id_produto}`, formData);
      toast.success('Compra confirmada! Obrigado! ❤️');
      setShowModal(false);
      setNotaFiscal('');
      setComprovante(null);
      carregarPresentes();
    } catch (error) {
      toast.error('Erro ao confirmar');
    } finally {
      setConfirming(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ width: 70, height: 70, background: '#0071e3', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShoppingBag size={35} color="white" />
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 600, marginBottom: 8 }}>Meus Presentes</h1>
        <p style={{ color: '#6e6e73' }}>
          Olá, {user.nome}! Aqui estão os presentes que você escolheu
        </p>
      </div>

      {presentes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 24 }}>
          <Gift size={64} color="#c6c6c8" style={{ marginBottom: 20 }} />
          <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>Nenhum presente ainda</h3>
          <p style={{ color: '#8e8e93', marginBottom: 24 }}>Você ainda não escolheu nenhum presente para levar</p>
          <Link to="/buscar" className="btn-primary" style={{ display: 'inline-block' }}>
            Buscar uma lista
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {presentes.map((presente) => (
            <div key={presente.id_convite} className="product-card">
              <div className="product-image" style={{ height: 200 }}>
                {presente.foto ? (
                  <img src={formatImageUrl(presente.foto)} alt={presente.nome} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Gift size={48} color="#6e6e73" />
                  </div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-title">{presente.nome}</h3>
                <div className="product-price">R$ {parseFloat(presente.preco).toFixed(2)}</div>
                
                <div style={{ marginBottom: 12 }}>
                  <span className={`badge ${presente.status === 'confirmado' ? 'badge-green' : 'badge-orange'}`}>
                    {presente.status === 'confirmado' ? (
                      <><CheckCircle size={14} style={{ display: 'inline', marginRight: 4 }} /> Compra confirmada</>
                    ) : (
                      <><Clock size={14} style={{ display: 'inline', marginRight: 4 }} /> Aguardando confirmação</>
                    )}
                  </span>
                </div>
                
                <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 8 }}>
                  <strong>Evento:</strong> {presente.evento_titulo}
                </p>
                
                {presente.status === 'comprometido' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                    <button 
                      onClick={() => {
                        setPresenteSelecionado(presente);
                        setShowModal(true);
                      }}
                      className="btn-primary" 
                      style={{ width: '100%', fontSize: 13 }}
                    >
                      Confirmar pagamento
                    </button>
                    <Link 
                      to={`/lista/${presente.codigo_evento}`} 
                      className="btn-secondary" 
                      style={{ textAlign: 'center', fontSize: 13, padding: '10px' }}
                    >
                      Ver detalhes do evento
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Confirmar compra de {presenteSelecionado?.nome}</div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Número da Nota Fiscal (opcional)</label>
                <input
                  type="text"
                  value={notaFiscal}
                  onChange={(e) => setNotaFiscal(e.target.value)}
                  className="form-input"
                  placeholder="Número da NF"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Comprovante / Foto do Cupom *</label>
                <input
                  type="file"
                  onChange={(e) => setComprovante(e.target.files[0])}
                  accept="image/*"
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
              <button onClick={handleConfirmar} disabled={confirming} className="btn-primary">
                {confirming ? 'Enviando...' : 'Confirmar Compra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}