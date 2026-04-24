import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, User, Search, Gift, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api, { BASE_URL, formatImageUrl } from '../services/api';
import toast from 'react-hot-toast';

export default function ListaPresentes() {
    const { codigo } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [evento, setEvento] = useState(null);
    const [produtos, setProdutos] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [comprometendo, setComprometendo] = useState(null);
    const [showLoginToast, setShowLoginToast] = useState(false);

    useEffect(() => {
        if (location.state?.evento) {
            setEvento(location.state.evento);
            carregarProdutos(location.state.evento.id_evento);
        } else {
            carregarEvento();
        }
    }, [codigo]);

    useEffect(() => {
        filtrarProdutos();
    }, [search, filter, produtos]);

    const carregarEvento = async () => {
        try {
            const response = await api.get(`/eventos/buscar/${codigo}`);
            setEvento(response.data);
            carregarProdutos(response.data.id_evento);
        } catch (error) {
            console.error('Erro:', error);
            toast.error('Evento não encontrado');
            navigate('/buscar');
        }
    };

    const carregarProdutos = async (idEvento) => {
        try {
            const response = await api.get(`/produtos/evento/${idEvento}`);
            setProdutos(response.data);
            setFiltered(response.data);
        } catch (error) {
            console.error('Erro:', error);
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

    const handleComprometer = (produto) => {
        if (!user) {
            // Salvar produto pendente
            localStorage.setItem('pending_product', JSON.stringify({
                id_produto: produto.id_produto,
                id_evento: evento.id_evento,
                codigo: codigo
            }));

            toast.custom((t) => (
                <div style={{
                    background: 'white',
                    borderRadius: 16,
                    padding: 20,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    maxWidth: 320,
                    textAlign: 'center'
                }}>
                    <Heart size={32} color="#0071e3" style={{ marginBottom: 12 }} />
                    <p style={{ marginBottom: 16, fontSize: 14 }}>Faça login para comprometer este presente</p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                navigate('/login');
                            }}
                            style={{ padding: '8px 16px', background: '#0071e3', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                        >
                            Fazer login
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #d2d2d6', borderRadius: 8, cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ), { duration: 8000 });
            return;
        }

        comprometerPresente(produto);
    };

    const comprometerPresente = async (produto) => {
        setComprometendo(produto.id_produto);
        try {
            await api.post('/convidados/comprometer', {
                id_produto: produto.id_produto,
                nome: user.nome,
                email: user.email,
                telefone: ''
            });
            toast.success(`Você se comprometeu com ${produto.nome}! 🎁`);
            carregarProdutos(evento.id_evento);
        } catch (error) {
            console.error('Erro:', error);
            toast.error('Erro ao comprometer');
        } finally {
            setComprometendo(null);
        }
    };

    const jaComprometido = (produto) => {
        if (!user) return false;
        return produto.convidados?.some(c => c?.email === user.email);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e5e5e7', borderTopColor: '#0071e3', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    if (!evento) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <h2>Evento não encontrado</h2>
                <button onClick={() => navigate('/buscar')} style={{ marginTop: 20, padding: '12px 24px', background: '#0071e3', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                    Voltar para buscar
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header do Evento */}
            <div style={{ background: 'white', borderBottom: '1px solid #e5e5e7', padding: '40px 0' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                    <h1 style={{ fontSize: 36, fontWeight: 600, marginBottom: 16 }}>{evento.titulo}</h1>
                    <p style={{ color: '#6e6e73', marginBottom: 24 }}>{evento.descricao || 'Sem descrição'}</p>

                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Calendar size={18} color="#0071e3" />
                            <span>{evento.data_evento ? new Date(evento.data_evento).toLocaleDateString('pt-BR') : 'Data a definir'}</span>
                        </div>
                        {evento.local && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <MapPin size={18} color="#0071e3" />
                                <span>{evento.local}</span>
                            </div>
                        )}
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
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 20px' }}>
                <div style={{ maxWidth: 400, margin: '0 auto 32px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8e8e93' }} />
                        <input
                            type="text"
                            placeholder="Buscar presente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px 12px 48px', border: '1px solid #d2d2d6', borderRadius: 12, fontSize: 16 }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setFilter('all')}
                        style={{
                            padding: '8px 20px',
                            border: 'none',
                            borderRadius: 20,
                            cursor: 'pointer',
                            background: filter === 'all' ? '#0071e3' : 'transparent',
                            color: filter === 'all' ? 'white' : '#1d1d1f',
                            fontWeight: 500
                        }}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('available')}
                        style={{
                            padding: '8px 20px',
                            border: 'none',
                            borderRadius: 20,
                            cursor: 'pointer',
                            background: filter === 'available' ? '#0071e3' : 'transparent',
                            color: filter === 'available' ? 'white' : '#1d1d1f',
                            fontWeight: 500
                        }}
                    >
                        Disponíveis
                    </button>
                    <button
                        onClick={() => setFilter('purchased')}
                        style={{
                            padding: '8px 20px',
                            border: 'none',
                            borderRadius: 20,
                            cursor: 'pointer',
                            background: filter === 'purchased' ? '#0071e3' : 'transparent',
                            color: filter === 'purchased' ? 'white' : '#1d1d1f',
                            fontWeight: 500
                        }}
                    >
                        Já comprados
                    </button>
                </div>

                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 80 }}>
                        <Gift size={64} color="#c6c6c8" style={{ marginBottom: 16 }} />
                        <p style={{ color: '#8e8e93' }}>Nenhum presente encontrado</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                        {filtered.map(produto => (
                            <div key={produto.id_produto} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}>
                                {/* Imagem do produto */}
                                <div style={{ height: 200, overflow: 'hidden', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    {produto.foto ? (
                                        <img
                                            src={formatImageUrl(produto.foto)}
                                            alt={produto.nome}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="1.5">
                                                <rect x="2" y="2" width="20" height="20" rx="2" />
                                                <circle cx="8.5" cy="8.5" r="2.5" />
                                                <path d="M21 15l-5-4-3 3-4-4-5 5" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Badge de status */}
                                    {produto.comprado && (
                                        <div style={{ position: 'absolute', top: 12, right: 12, background: '#c62828', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                                            Comprado
                                        </div>
                                    )}
                                </div>

                                <div style={{ padding: 20 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#1d1d1f' }}>{produto.nome}</h3>
                                    <div style={{ fontSize: 20, fontWeight: 700, color: '#0071e3', marginBottom: 12 }}>
                                        R$ {parseFloat(produto.preco).toFixed(2)}
                                    </div>

                                    {produto.link && (
                                        <a
                                            href={produto.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ display: 'block', fontSize: 13, color: '#0071e3', textDecoration: 'none', marginBottom: 12 }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Ver produto →
                                        </a>
                                    )}

                                    {produto.observacao && (
                                        <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 12, lineHeight: 1.4 }}>{produto.observacao}</p>
                                    )}

                                    {produto.convidados && produto.convidados.length > 0 && (
                                        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f7', borderRadius: 12 }}>
                                            <strong style={{ fontSize: 12, color: '#6e6e73' }}>Quem vai levar:</strong>
                                            <div style={{ marginTop: 4 }}>
                                                {produto.convidados.map((c, idx) => c && (
                                                    <span key={idx} style={{ fontSize: 12, display: 'inline-block', marginRight: 8, marginBottom: 4 }}>
                                                        {c.nome} {c.status === 'confirmado' ? '✅' : '🔔'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!produto.comprado && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleComprometer(produto);
                                            }}
                                            disabled={comprometendo === produto.id_produto || (user && jaComprometido(produto))}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                background: (user && jaComprometido(produto)) ? '#e5e5e7' : '#0071e3',
                                                color: (user && jaComprometido(produto)) ? '#8e8e93' : 'white',
                                                border: 'none',
                                                borderRadius: 8,
                                                cursor: (user && jaComprometido(produto)) ? 'not-allowed' : 'pointer',
                                                fontWeight: 500,
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            {comprometendo === produto.id_produto ? (
                                                'Carregando...'
                                            ) : (user && jaComprometido(produto)) ? (
                                                '✓ Você já escolheu este presente'
                                            ) : (
                                                '🎁 Quero levar este presente'
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}