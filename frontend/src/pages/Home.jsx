import { Link } from 'react-router-dom';
import { Gift, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="hero" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="container" style={{ maxWidth: 800, textAlign: 'center' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ width: 100, height: 100, background: '#0071e3', borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
            <Gift size={50} color="white" />
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 700, marginBottom: 16, background: 'linear-gradient(135deg, #1d1d1f, #0071e3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Lista de Presentes
          </h1>
          <p style={{ fontSize: 20, color: '#6e6e73', maxWidth: 500, margin: '0 auto' }}>
            A forma mais elegante de organizar seus presentes e evitar repetições
          </p>
        </div>
        
        <Link to="/buscar" className="btn-primary" style={{ padding: '16px 40px', fontSize: 18 }}>
          Começar agora
          <ArrowRight size={20} style={{ display: 'inline', marginLeft: 8 }} />
        </Link>
        
        <div style={{ marginTop: 80, display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 50, height: 50, background: '#f5f5f7', borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Users size={24} color="#0071e3" />
            </div>
            <p style={{ fontSize: 14, color: '#6e6e73' }}>Para convidados</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 50, height: 50, background: '#f5f5f7', borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <MapPin size={24} color="#0071e3" />
            </div>
            <p style={{ fontSize: 14, color: '#6e6e73' }}>Local do evento</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 50, height: 50, background: '#f5f5f7', borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Calendar size={24} color="#0071e3" />
            </div>
            <p style={{ fontSize: 14, color: '#6e6e73' }}>Data especial</p>
          </div>
        </div>
      </div>
    </div>
  );
}