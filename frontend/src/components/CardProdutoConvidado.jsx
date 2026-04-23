import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CheckCircle, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api, { BASE_URL } from '../services/api';
import toast from 'react-hot-toast';

export default function CardProdutoConvidado({ produto, idEvento, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [dadosConvidado, setDadosConvidado] = useState({ nome: '', email: '', telefone: '' });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const jaComprado = produto.comprado;
  const meuCompromisso = !user && produto.convidados?.find(c => c?.email === localStorage.getItem('email_convidado'));

  const handleComprometer = () => {
    if (user) {
      // Usuário logado (dono do evento)
      toast.error('Você é o organizador, não pode comprar seus próprios presentes');
    } else {
      // Convidado não logado
      setShowModal(true);
    }
  };

  const salvarCompromisso = async () => {
    if (!dadosConvidado.nome || !dadosConvidado.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/convidados/comprometer', {
        id_produto: produto.id_produto,
        nome: dadosConvidado.nome,
        email: dadosConvidado.email,
        telefone: dadosConvidado.telefone
      });
      
      localStorage.setItem('email_convidado', dadosConvidado.email);
      localStorage.setItem('nome_convidado', dadosConvidado.nome);
      
      toast.success('Presente comprometido! 🎁');
      setShowModal(false);
      onUpdate();
    } catch (error) {
      toast.error('Erro ao comprometer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="product-card">
        <div className="product-image">
          {produto.foto ? (
            <img src={`${BASE_URL}${produto.foto}`} alt={produto.nome} />
          ) : (
            <ShoppingBag size={48} color="#6e6e73" />
          )}
        </div>
        
        <div className="product-info">
          <h3 className="product-title">{produto.nome}</h3>
          <div className="product-price">{parseFloat(produto.preco).toFixed(2)}</div>
          
          <span className={`product-status ${jaComprado ? 'status-purchased' : 'status-available'}`}>
            {jaComprado ? '✓ Já comprado' : '📦 Disponível'}
          </span>
          
          {produto.link && (
            <a href={produto.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#0071e3', textDecoration: 'none', display: 'block', marginBottom: 12 }}>
              Ver produto →
            </a>
          )}
          
          {produto.observacao && (
            <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 12 }}>{produto.observacao}</p>
          )}
          
          {produto.convidados && produto.convidados.length > 0 && (
            <div className="product-buyers">
              <strong>Quem vai levar:</strong><br/>
              {produto.convidados.map((c, idx) => c && (
                <span key={idx}>{c.nome} {c.status === 'confirmado' ? '✅' : '🔔'}</span>
              ))}
            </div>
          )}
          
          {!jaComprado && (
            <button onClick={handleComprometer} className="btn-primary" style={{ width: '100%', marginTop: 16 }}>
              <Heart size={16} style={{ display: 'inline', marginRight: 8 }} />
              Quero levar este presente
            </button>
          )}
        </div>
      </div>

      {/* Modal para dados do convidado */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">Seus dados</div>
            <div className="modal-body">
              <p style={{ marginBottom: 20, color: '#6e6e73' }}>Informe seus dados para comprometer este presente</p>
              
              <div className="form-group">
                <label className="form-label">Nome completo *</label>
                <input
                  type="text"
                  value={dadosConvidado.nome}
                  onChange={(e) => setDadosConvidado({ ...dadosConvidado, nome: e.target.value })}
                  className="form-input"
                  placeholder="Seu nome"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={dadosConvidado.email}
                  onChange={(e) => setDadosConvidado({ ...dadosConvidado, email: e.target.value })}
                  className="form-input"
                  placeholder="seu@email.com"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input
                  type="tel"
                  value={dadosConvidado.telefone}
                  onChange={(e) => setDadosConvidado({ ...dadosConvidado, telefone: e.target.value })}
                  className="form-input"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
              <button onClick={salvarCompromisso} disabled={loading} className="btn-primary">
                {loading ? 'Salvando...' : 'Comprometer presente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}