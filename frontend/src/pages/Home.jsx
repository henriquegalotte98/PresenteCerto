import { Link } from 'react-router-dom';
import { Gift, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="hero" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: 64 }}
        >
          <div style={{
            width: 80,
            height: 80,
            background: 'var(--primary)',
            borderRadius: 0, // Sharp minimalist look
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 40px',
            boxShadow: 'var(--shadow)'
          }}>
            <Gift size={40} color="var(--bg-main)" />
          </div>

          <h1>
            A Arte de <br />
            <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Presentear</span> com Elegância
          </h1>

          <p>
            Organize sua lista de desejos em um ambiente sofisticado e minimalista.
            Uma experiência exclusiva para momentos inesquecíveis.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/buscar" className="btn-primary">
              Criar minha lista
              <ArrowRight size={18} style={{ marginLeft: 10 }} />
            </Link>
            <Link to="/buscar" className="btn-secondary">
              Buscar Lista
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 40,
            paddingTop: 64,
            borderTop: '1px solid var(--border)'
          }}
        >
          <div className="feature-item">
            <Users size={24} color="var(--primary)" style={{ marginBottom: 12 }} />
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-main)' }}>Convidados</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Experiência fluida e intuitiva</p>
          </div>
          <div className="feature-item">
            <MapPin size={24} color="var(--primary)" style={{ marginBottom: 12 }} />
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-main)' }}>Localização</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Integração com mapas reais</p>
          </div>
          <div className="feature-item">
            <Calendar size={24} color="var(--primary)" style={{ marginBottom: 12 }} />
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-main)' }}>Eventos</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Gestão completa de datas</p>
          </div>
          <div className="feature-item">
            <Gift size={24} color="var(--primary)" style={{ marginBottom: 12 }} />
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-main)' }}>Presentes</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Evite itens duplicados</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
};
