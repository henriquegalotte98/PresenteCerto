import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import BuscarLista from './pages/BuscarLista';
import ListaPresentes from './pages/ListaPresentes';
import MeusPresentes from './pages/MeusPresentes';
import MeusEventos from './pages/MeusEventos';
import CriarEvento from './pages/CriarEvento';
import PainelDono from './pages/PainelDono';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<BuscarLista />} />
          <Route path="/lista/:codigo" element={<ListaPresentes />} />
          <Route path="/meus-presentes" element={<MeusPresentes />} />
          <Route path="/meus-eventos" element={<MeusEventos />} />
          <Route path="/criar-evento" element={<CriarEvento />} />
          <Route path="/painel-dono/:idEvento?" element={<PainelDono />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;