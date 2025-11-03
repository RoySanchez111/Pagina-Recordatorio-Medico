import React, { useState, useEffect } from 'react';
import './App.css'; 

function ModalMedicamento({ isOpen, onClose, onSave, medicamentoInicial }) {
  
  const [formData, setFormData] = useState({
    nombre: '',
    dosis: '',
    frecuencia: '',
    duracion: '',
    instrucciones: ''
  });

  useEffect(() => {
    if (isOpen && medicamentoInicial) {
      setFormData(medicamentoInicial);
    } else if (isOpen && !medicamentoInicial) {
      setFormData({
        nombre: '',
        dosis: '',
        frecuencia: '',
        duracion: '',
        instrucciones: ''
      });
    }
  }, [isOpen, medicamentoInicial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) {
    return null;
  }

  const esModoEdicion = medicamentoInicial !== null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{esModoEdicion ? 'Editar Medicamento' : 'Agregar Medicamento'}</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          
          <div className="form-group">
            <label>Nombre del Medicamento</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Paracetamol 500mg"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Dosis</label>
            <input
              type="text"
              name="dosis"
              value={formData.dosis}
              onChange={handleChange}
              placeholder="Ej. 1 cápsula"
              required
            />
          </div>

          <div className="form-group">
            <label>Frecuencia</label>
            <input
              type="text"
              name="frecuencia"
              value={formData.frecuencia}
              onChange={handleChange}
              placeholder="Ej. cada 8 horas"
              required
            />
          </div>

          <div className="form-group">
            <label>Duración del Tratamiento</label>
            <input
              type="text"
              name="duracion"
              value={formData.duracion}
              onChange={handleChange}
              placeholder="Ej. 7 días"
              required
            />
          </div>

          <div className="form-group">
            <label>Instrucciones Adicionales (Opcional)</label>
            <textarea
              name="instrucciones"
              value={formData.instrucciones}
              onChange={handleChange}
              rows="3"
              placeholder="Ej. Tomar después de los alimentos"
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {esModoEdicion ? 'Guardar Cambios' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalMedicamento;
