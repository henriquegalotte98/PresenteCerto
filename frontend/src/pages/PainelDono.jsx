import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Gift, Copy, Calendar, MapPin, Users, Image } from 'lucide-react';
import api, { BASE_URL } from '../services/api';
import toast from 'react-hot-toast';
import BotaoDeletar from './DeletarLista';


export default function PainelDono() {
    const { idEvento } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [evento, setEvento] = useState(null);
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({ nome: '', preco: '', link: '', observacao: '' });
    const [foto, setFoto] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [showColaborador, setShowColaborador] = useState(false);
    const [emailColaborador, setEmailColaborador] = useState('');
    const [eventos, setEventos] = useState([]);


    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (idEvento) {
            carregarEvento(idEvento);
        } else {
            carregarPrimeiroEvento();
        }
    }, [idEvento, user]);

    const carregarEvento = async (id) => {
        try {
            const response = await api.get(`/eventos/${id}`);
            setEvento(response.data);
            carregarProdutos(id);
        } catch (error) {
            console.error('Erro:', error);
            toast.error('Evento não encontrado');
            navigate('/meus-eventos');
        }
    };

    const carregarPrimeiroEvento = async () => {
        try {
            const response = await api.get('/eventos/meus-eventos');
            if (response.data && response.data.length > 0) {
                const primeiroEvento = response.data[0];
                setEvento(primeiroEvento);
                carregarProdutos(primeiroEvento.id_evento);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Erro:', error);
            setLoading(false);
        }
    };
    const handleDeleteSuccess = (eventoId) => {
        setEventos(eventos.filter(evento => evento.id_evento !== eventoId));
    };
    const carregarProdutos = async (idEvento) => {
        try {
            const response = await api.get(`/produtos/evento/${idEvento}`);
            setProdutos(response.data);
        } catch (error) {
            console.error('Erro:', error);
            toast.error('Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    };

    const salvarProduto = async () => {
        console.log('=== SALVANDO PRODUTO ===');
        console.log('formData:', formData);
        console.log('foto state:', foto);
        console.log('fotoPreview:', fotoPreview);

        if (!formData.nome || !formData.preco) {
            toast.error('Nome e preço são obrigatórios');
            return;
        }

        // Criar FormData corretamente
        const formDataObj = new FormData();
        formDataObj.append('id_evento', evento.id_evento.toString());
        formDataObj.append('nome', formData.nome);
        formDataObj.append('preco', formData.preco.toString());
        formDataObj.append('link', formData.link || '');
        formDataObj.append('observacao', formData.observacao || '');

        // IMPORTANTE: Verificar se foto é um arquivo válido
        if (foto && foto instanceof File) {
            console.log('Adicionando foto ao FormData:', foto.name, foto.type, foto.size);
            formDataObj.append('foto', foto);
        } else {
            console.log('Nenhuma foto válida para enviar. foto é:', foto);
        }

        // Log do conteúdo do FormData para debug
        console.log('Conteúdo do FormData:');
        for (let pair of formDataObj.entries()) {
            console.log(pair[0], pair[1]);
        }

        try {
            let response;
            if (editing) {
                response = await api.put(`/produtos/${editing.id_produto}`, formDataObj, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success('Produto atualizado!');
            } else {
                response = await api.post('/produtos', formDataObj, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success('Produto adicionado!');
            }

            console.log('Resposta do servidor:', response.data);
            carregarProdutos(evento.id_evento);
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Erro detalhado:', error);
            console.error('Resposta do erro:', error.response?.data);
            toast.error('Erro ao salvar produto: ' + (error.response?.data?.error || error.message));
        }
    };
    const deletarProduto = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar este produto?')) {
            try {
                await api.delete(`/produtos/${id}`);
                toast.success('Produto deletado');
                carregarProdutos(evento.id_evento);
            } catch (error) {
                toast.error('Erro ao deletar');
            }
        }
    };

    const resetForm = () => {
        setFormData({ nome: '', preco: '', link: '', observacao: '' });
        setFoto(null);
        setFotoPreview(null);
        setEditing(null);
    };

    const editarProduto = (produto) => {
        setEditing(produto);
        setFormData({
            nome: produto.nome,
            preco: produto.preco,
            link: produto.link || '',
            observacao: produto.observacao || ''
        });
        if (produto.foto) {
            setFotoPreview(`${BASE_URL}${produto.foto}`);
        }
        setShowModal(true);
    };

    const copiarCodigo = () => {
        if (evento && evento.codigo) {
            navigator.clipboard.writeText(evento.codigo);
            toast.success('Código copiado!');
        }
    };

    const adicionarColaborador = async () => {
        if (!emailColaborador) {
            toast.error('Digite o email do colaborador');
            return;
        }

        try {
            await api.post('/eventos/colaborador', {
                email_colaborador: emailColaborador,
                codigo_evento: evento.codigo
            });
            toast.success('Colaborador adicionado com sucesso!');
            setShowColaborador(false);
            setEmailColaborador('');
        } catch (error) {
            toast.error('Erro ao adicionar colaborador');
        }
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        console.log('Arquivo selecionado:', file);

        if (file) {
            // Verificar se é imagem
            if (!file.type.startsWith('image/')) {
                toast.error('Por favor, selecione apenas imagens');
                return;
            }

            // Verificar tamanho (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('A imagem deve ter no máximo 5MB');
                return;
            }

            setFoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            console.log('Nenhum arquivo selecionado');
        }
    };

    if (!user) return null;

    if (!evento && !loading) {
        return (
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
                <Gift size={64} color="#c6c6c8" style={{ marginBottom: 24 }} />
                <h2 style={{ fontSize: 28, marginBottom: 16 }}>Você ainda não tem nenhum evento</h2>
                <p style={{ color: '#6e6e73', marginBottom: 32 }}>Crie seu primeiro evento para começar a adicionar presentes</p>
                <button
                    onClick={() => navigate('/criar-evento')}
                    style={{ padding: '12px 24px', background: '#0071e3', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}
                >
                    Criar meu primeiro evento
                </button>
            </div>
        );
    }

    if (loading || !evento) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e5e5e7', borderTopColor: '#0071e3', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>
            {/* Header do Evento */}
            <div style={{ background: 'white', borderRadius: 20, padding: 32, marginBottom: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>{evento.titulo}</h1>
                        <p style={{ color: '#6e6e73', marginBottom: 16 }}>{evento.descricao || 'Sem descrição'}</p>

                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Calendar size={16} color="#6e6e73" />
                                <span style={{ fontSize: 14, color: '#6e6e73' }}>
                                    {evento.data_evento ? new Date(evento.data_evento).toLocaleDateString('pt-BR') : 'Data a definir'}
                                </span>
                            </div>
                            {evento.local && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <MapPin size={16} color="#6e6e73" />
                                    <span style={{ fontSize: 14, color: '#6e6e73' }}>{evento.local}</span>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <code style={{ background: '#f5f5f7', padding: '8px 16px', borderRadius: 8, fontSize: 16, fontFamily: 'monospace', letterSpacing: 1 }}>
                                {evento.codigo}
                            </code>
                            <button onClick={copiarCodigo} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0071e3', padding: 8 }}>
                                <Copy size={18} />
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={() => setShowColaborador(true)}
                            style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #0071e3', color: '#0071e3', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <Users size={16} />
                            Adicionar cônjuge
                        </button>
                        <button
                            onClick={() => navigate(`/lista/${evento.codigo}`)}
                            style={{ padding: '10px 20px', background: '#e5e5e7', border: 'none', color: '#1d1d1f', borderRadius: 8, cursor: 'pointer' }}
                        >
                            Visualizar lista
                        </button>
                    </div>
                </div>
            </div>

            {/* Estatísticas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                <div style={{ background: 'white', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#0071e3' }}>{produtos.length}</div>
                    <div style={{ fontSize: 14, color: '#6e6e73' }}>Total de presentes</div>
                </div>
                <div style={{ background: 'white', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#2e7d32' }}>{produtos.filter(p => p.comprado).length}</div>
                    <div style={{ fontSize: 14, color: '#6e6e73' }}>Presentes comprados</div>
                </div>
                <div style={{ background: 'white', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#ed6c02' }}>{produtos.filter(p => !p.comprado).length}</div>
                    <div style={{ fontSize: 14, color: '#6e6e73' }}>Disponíveis</div>
                </div>
            </div>

            {/* Botão Adicionar */}
            <div style={{ marginBottom: 24 }}>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    style={{ padding: '12px 24px', background: '#0071e3', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}
                >
                    <Plus size={18} />
                    Adicionar presente
                </button>


            </div>
            <div>
                <BotaoDeletar
                    eventoId={evento.id_evento}
                    onDeleteSuccess={handleDeleteSuccess}
                />
            </div>
            {/* Lista de produtos */}
            <div style={{ background: 'white', borderRadius: 16, overflow: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e5e5e7', background: '#f5f5f7' }}>
                            <th style={{ textAlign: 'left', padding: '16px', fontWeight: 600 }}>Produto</th>
                            <th style={{ textAlign: 'left', padding: '16px', fontWeight: 600 }}>Preço</th>
                            <th style={{ textAlign: 'left', padding: '16px', fontWeight: 600 }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '16px', fontWeight: 600 }}>Convidados</th>
                            <th style={{ textAlign: 'left', padding: '16px', fontWeight: 600 }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {produtos.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: '#8e8e93' }}>
                                    <Gift size={48} color="#c6c6c8" style={{ marginBottom: 16 }} />
                                    <div>Nenhum produto cadastrado</div>
                                    <button
                                        onClick={() => { resetForm(); setShowModal(true); }}
                                        style={{ marginTop: 16, padding: '8px 16px', background: '#0071e3', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                                    >
                                        Adicionar primeiro presente
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            produtos.map((produto) => (
                                <tr key={produto.id_produto} style={{ borderBottom: '1px solid #e5e5e7' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            {produto.foto ? (
                                                <img
                                                    src={`${BASE_URL}${produto.foto}`}
                                                    alt={produto.nome}
                                                    style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const parent = e.target.parentElement;
                                                        parent.innerHTML = '<div style="width:48px;height:48px;background:#f5f5f7;border-radius:8px;display:flex;align-items:center;justify-content:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6e6e73"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8.5" cy="8.5" r="2.5"/></svg></div>';
                                                    }}
                                                />
                                            ) : (
                                                <div style={{ width: 48, height: 48, background: '#f5f5f7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Gift size={24} color="#6e6e73" />
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{produto.nome}</div>
                                                {produto.link && (
                                                    <a href={produto.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#0071e3', textDecoration: 'none' }}>
                                                        Ver link →
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: 600, color: '#0071e3' }}>
                                        R$ {parseFloat(produto.preco).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: 20,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            background: produto.comprado ? '#ffebee' : '#e8f5e9',
                                            color: produto.comprado ? '#c62828' : '#2e7d32'
                                        }}>
                                            {produto.comprado ? 'Comprado' : 'Disponível'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        {produto.convidados && produto.convidados.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                {produto.convidados.map((c, idx) => c && (
                                                    <span key={idx} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        {c.nome}
                                                        {c.status === 'confirmado' ? '✅' : '🔔'}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: 12, color: '#8e8e93' }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => editarProduto(produto)}
                                                style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #0071e3', color: '#0071e3', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
                                            >
                                                <Edit2 size={14} style={{ display: 'inline', marginRight: 4 }} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => deletarProduto(produto.id_produto)}
                                                style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
                                            >
                                                <Trash2 size={14} style={{ display: 'inline', marginRight: 4 }} />
                                                Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Produto */}
            {showModal && (
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Foto do produto</label>
                    <input
                        type="file"
                        onChange={handleFotoChange}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d2d2d6',
                            borderRadius: 8,
                            cursor: 'pointer'
                        }}
                    />
                    {fotoPreview && (
                        <div style={{ marginTop: 12 }}>
                            <img src={fotoPreview} alt="Preview" style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover' }} />
                            <button
                                onClick={() => { setFoto(null); setFotoPreview(null); }}
                                style={{ marginLeft: 12, padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                            >
                                Remover
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Produto */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000, padding: '20px'
                }}>
                    <div style={{
                        background: 'white', borderRadius: 24,
                        maxWidth: 550, width: '100%',
                        maxHeight: '90vh', overflow: 'auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ padding: '24px 24px 0 24px' }}>
                            <h2 style={{ fontSize: 24, fontWeight: 600 }}>{editing ? 'Editar' : 'Novo'} presente</h2>
                            <p style={{ color: '#6e6e73', marginTop: 4 }}>Preencha as informações do produto</p>
                        </div>

                        <div style={{ padding: 24 }}>
                            {/* Nome */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Nome do presente *</label>
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #d2d2d6', borderRadius: 8, fontSize: 16 }}
                                    placeholder="Ex: Jogo de Panelas"
                                />
                            </div>

                            {/* Preço */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Preço *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.preco}
                                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #d2d2d6', borderRadius: 8, fontSize: 16 }}
                                    placeholder="0,00"
                                />
                            </div>

                            {/* Link */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Link do produto</label>
                                <input
                                    type="url"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #d2d2d6', borderRadius: 8, fontSize: 16 }}
                                    placeholder="https://www.exemplo.com/produto"
                                />
                            </div>

                            {/* Observações */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Observações</label>
                                <textarea
                                    value={formData.observacao}
                                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                                    rows="3"
                                    style={{ width: '100%', padding: '12px', border: '1px solid #d2d2d6', borderRadius: 8, fontSize: 16, fontFamily: 'inherit' }}
                                    placeholder="Cor, tamanho, modelo, etc..."
                                />
                            </div>

                            {/* INPUT DE FOTO CORRIGIDO */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Foto do produto</label>
                                <input
                                    type="file"
                                    onChange={handleFotoChange}
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #d2d2d6',
                                        borderRadius: 8,
                                        cursor: 'pointer'
                                    }}
                                />
                                {fotoPreview && (
                                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <img src={fotoPreview} alt="Preview" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                                        <button
                                            onClick={() => { setFoto(null); setFotoPreview(null); }}
                                            style={{ padding: '6px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                                        >
                                            Remover foto
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: '0 24px 24px 24px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #d2d2d6', borderRadius: 8, cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={salvarProduto}
                                style={{ padding: '10px 24px', background: '#0071e3', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                            >
                                {editing ? 'Atualizar' : 'Adicionar'} presente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}