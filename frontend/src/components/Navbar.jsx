import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, LayoutDashboard, Sparkles, Menu, X, Search } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)}>
          Presente<span style={{ color: 'var(--primary)' }}>Certo</span>
        </Link>
        
        {/* Burger Button */}
        <button className="menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/buscar" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <Search size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Buscar
          </Link>

          {user ? (
            <>
              <Link to="/meus-presentes" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Meus presentes
              </Link>
              
              <Link to="/meus-eventos" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Eventos
              </Link>

              <Link to="/criar-evento" className="btn-primary" onClick={() => setIsMenuOpen(false)}>
                Novo Evento
              </Link>
              
              <div className="nav-user-info">
                <span className="user-name">{user.nome}</span>
                <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px' }}>Sair</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
              <Link to="/cadastro" className="btn-primary" onClick={() => setIsMenuOpen(false)}>Começar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}