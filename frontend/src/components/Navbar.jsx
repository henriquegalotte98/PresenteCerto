import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Gift, ShoppingBag, LayoutDashboard, PlusCircle, Sparkles, Menu, X } from 'lucide-react';

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
        <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)}>Lista Presentes</Link>
        
        {/* Burger Button */}
        <button className="menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              <Link to="/buscar" className="nav-link" onClick={() => setIsMenuOpen(false)}>Buscar lista</Link>
              <Link to="/meus-presentes" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <ShoppingBag size={16} style={{ display: 'inline', marginRight: 6 }} />
                Meus presentes
              </Link>
              
              <Link to="/criar-evento" className="btn-primary nav-cta" onClick={() => setIsMenuOpen(false)}>
                <Sparkles size={16} />
                Criar meu evento
              </Link>
              
              {user.is_admin && (
                <Link to="/meus-eventos" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <LayoutDashboard size={16} style={{ display: 'inline', marginRight: 6 }} />
                  Meus eventos
                </Link>
              )}
              
              <div className="nav-user-info">
                <span className="user-name">Olá, {user.nome}</span>
                <button onClick={handleLogout} className="btn-secondary">Sair</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/buscar" className="nav-link" onClick={() => setIsMenuOpen(false)}>Buscar lista</Link>
              <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
              <Link to="/cadastro" className="btn-primary nav-cta" onClick={() => setIsMenuOpen(false)}>Cadastrar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}