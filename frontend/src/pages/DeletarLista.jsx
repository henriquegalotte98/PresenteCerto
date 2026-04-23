// componentes/BotaoDeletar.jsx
import React from 'react';
import api from '../services/api';

const BotaoDeletar = ({ eventoId, onDeleteSuccess }) => {
  const handleDelete = async () => {
    // Confirmação antes de deletar
    const confirmar = window.confirm('Tem certeza que deseja deletar este evento?');
    if (!confirmar) return;

    try {
      const response = await api.delete(`/eventos/${eventoId}`);
      
      if (response.data.success) {
        alert('Evento deletado com sucesso!');
        window.location.href = '/meus-eventos';
        // Chama a função para atualizar a lista
        if (onDeleteSuccess) {
          onDeleteSuccess(eventoId);
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        alert('Evento não encontrado');
      } else {
        alert('Erro ao deletar evento: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="btn-deletar"
      style={{
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Deletar Evento
    </button>
  );
};

export default BotaoDeletar;