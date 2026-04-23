import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, ShoppingBag, Users, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-playfair font-bold text-elegant">
          Olá, {user.nome}! 👋
        </h1>
        <p className="text-gray-600 mt-2">Bem-vindo ao seu dashboard</p>
      </motion.div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Gift, label: 'Presentes Disponíveis', value: '24', color: 'bg-blue-500' },
          { icon: ShoppingBag, label: 'Meus Presentes', value: '3', color: 'bg-green-500' },
          { icon: Users, label: 'Convidados', value: '12', color: 'bg-purple-500' },
          { icon: TrendingUp, label: 'Total Comprado', value: 'R$ 850,00', color: 'bg-gold' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className={`inline-flex p-3 rounded-xl ${stat.color} bg-opacity-10 mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <h3 className="text-2xl font-bold text-elegant">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}