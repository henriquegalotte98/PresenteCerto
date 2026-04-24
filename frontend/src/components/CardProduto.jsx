import { useState } from 'react';
import { CheckCircle, ShoppingBag, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api, { BASE_URL, formatImageUrl } from '../services/api';
import toast from 'react-hot-toast';

export default function CardProduto({ produto, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [comprovante, setComprovante] = useState(null);
  const [notaFiscal, setNotaFiscal] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const jaComprado = produto.comprado;
  const meuCompromisso = user && produto.compradores?.find(c => c?.id_usuario === user.id_usuario);

  const handleComprometer = async () => {
    if (!user) {
      toast((t) => (
        <div>
          <p>Faça login para se comprometer</p>
          <button onClick={() => window.location.href = '/login'} style={{ marginTop: 8 }}>Fazer login</button>
        </div>
      ), { duration: 5000 });
      return;
    }
    
    try {
      await api.post('/compras/comprometer', { id_produto: produto.id_produto });
      toast.success('Presente comprometido! 🎁');
      onUpdate();
    } catch (error) {
      toast.error('Erro ao comprometer');
    }
  };

  const handleConfirmar = async () => {
    if (!notaFiscal && !comprovante) {
      toast.error('Adicione a nota fiscal ou comprovante');
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append('nota_fiscal', notaFiscal);
    if (comprovante) formData.append('comprovante', comprovante);
    
    try {
      await api.post(`/compras/confirmar/${produto.id_produto}`, formData);
      toast.success('Compra confirmada! Obrigado!');
      setShowModal(false);
      setNotaFiscal('');
      setComprovante(null);
      onUpdate();
    } catch (error) {
      toast.error('Erro ao confirmar');
    } finally {
      setLoading(false);
    }
  };

  const handleRemover = async () => {
    try {
      await api.delete(`/compras/remover/${produto.id_produto}`);
      toast.success('Compromisso removido');
      onUpdate();
    } catch (error) {
      toast.error('Erro ao remover');
    }
  };

  return (
    <>
      <div className="product-card">
        <div className="product-image">
          {produto.foto ? (
            <img src={formatImageUrl(produto.foto)} alt={produto.nome} />
          ) : (
            <ShoppingBag size={48} color="#6e6e73" />
          )}
        </div>
        
        <div className="product-info">
          <h3 className="product-title">{produto.nome}</h3>
          <div className="product-price">{parseFloat(produto.preco).toFixed(2)}</div>
          
          <span className={`product-status ${jaComprado ? 'status-purchased' : 'status-available'}`}>
            {jaComprado ? '✓ Comprado' : '📦 Disponível'}
          </span>
          
          {produto.link && (
            <a href={produto.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#0071e3', textDecoration: 'none', display: 'block', marginBottom: 12 }}>
              Ver produto →
            </a>
          )}
          
          {produto.observacao && (
            <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 12 }}>{produto.observacao}</p>
          )}
          
          {produto.compradores && produto.compradores.length > 0 && produto.compradores[0] && (
            <div className="product-buyers">
              <strong>Quem comprou:</strong><br/>
              {produto.compradores.map((c, idx) => c && (
                <span key={idx}>{c.nome} {c.status === 'confirmado' ? '✅' : '🔔'}</span>
              ))}
            </div>
          )}
          
          {!jaComprado && (
            <div style={{ marginTop: 16 }}>
              {!user ? (
                <button onClick={handleComprometer} className="btn-primary" style={{ width: '100%' }}>
                  Quero este presente
                </button>
              ) : !meuCompromisso ? (
                <button onClick={handleComprometer} className="btn-primary" style={{ width: '100%' }}>
                  Quero este presente
                </button>
              ) : meuCompromisso.status === 'comprometido' ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowModal(true)} className="btn-primary" style={{ flex: 1 }}>
                    Confirmar compra
                  </button>
                  <button onClick={handleRemover} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              ) : (
                <span className="badge badge-green">✓ Compra confirmada</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Confirmar compra</div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nota fiscal</label>
                <input
                  type="text"
                  value={notaFiscal}
                  onChange={(e) => setNotaFiscal(e.target.value)}
                  className="form-input"
                  placeholder="Número da nota fiscal"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Comprovante (foto)</label>
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
              <button onClick={handleConfirmar} disabled={loading} className="btn-primary">
                {loading ? 'Confirmando...' : 'Confirmar compra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}