import React, { useState, useEffect } from "react";
import "./App.css";

function ModalMedicamento({ isOpen, onClose, onSave, medicamentoInicial }) {
  const [formData, setFormData] = useState({
    nombre: "",
    dosis: "",
    fechaInicio: "",
    fechaFin: "",
    instrucciones: "",
    tipoHorario: "Fijo",
    horasFijas: [],
  });

  const [nuevaHoraFija, setNuevaHoraFija] = useState("08:00");
  const [duracionCalculada, setDuracionCalculada] = useState("");

  useEffect(() => {
    if (isOpen) {
      const defaultState = {
        nombre: "",
        dosis: "",
        fechaInicio: "",
        fechaFin: "",
        instrucciones: "",
        tipoHorario: "Fijo",
        horasFijas: [],
      };

      if (medicamentoInicial) {
        // Para edición, mezclar los datos existentes con el estado por defecto
        setFormData({
          ...defaultState,
          ...medicamentoInicial,
          // Asegurar que horasFijas sea un array y tipoHorario sea "Fijo"
          horasFijas: medicamentoInicial.horasFijas || [],
          tipoHorario: "Fijo"
        });
      } else {
        // Para nuevo medicamento, usar estado por defecto
        setFormData(defaultState);
      }
      setNuevaHoraFija("08:00");
    }
  }, [isOpen, medicamentoInicial]);

  // Calcular duración cuando cambian las fechas
  useEffect(() => {
    if (formData.fechaInicio && formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio);
      const fin = new Date(formData.fechaFin);
      
      if (fin >= inicio) {
        const diferencia = fin.getTime() - inicio.getTime();
        const dias = Math.ceil(diferencia / (1000 * 3600 * 24)) + 1;
        setDuracionCalculada(`${dias} día${dias !== 1 ? 's' : ''}`);
      } else {
        setDuracionCalculada("Fechas inválidas");
      }
    } else {
      setDuracionCalculada("");
    }
  }, [formData.fechaInicio, formData.fechaFin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgregarHoraFija = () => {
    if (nuevaHoraFija && !formData.horasFijas.includes(nuevaHoraFija)) {
      setFormData((prev) => ({
        ...prev,
        horasFijas: [...prev.horasFijas, nuevaHoraFija].sort(),
      }));
      const [h, m] = nuevaHoraFija.split(':');
      const nextHour = ((parseInt(h, 10) + 1) % 24).toString().padStart(2, '0');
      setNuevaHoraFija(`${nextHour}:${m}`);
    }
  };

  const handleEliminarHoraFija = (horaAEliminar) => {
    setFormData((prev) => ({
      ...prev,
      horasFijas: prev.horasFijas.filter((hora) => hora !== horaAEliminar),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.horasFijas.length === 0) {
      alert("Por favor, añada al menos una Hora Fija.");
      return;
    }

    // Incluir la duración calculada en los datos a guardar
    const datosCompletos = {
      ...formData,
      duracion: duracionCalculada
    };
    
    onSave(datosCompletos);
  };

  const formatTime = (hour, minute) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    let displayHour = hour % 12;
    if (displayHour === 0) displayHour = 12;

    if (hour === 0 && minute === 0) return "12:00 AM (Media Noche)";
    if (hour === 12 && minute === 0) return "12:00 PM (Medio Día)";

    const displayMinute = minute.toString().padStart(2, "0");
    return `${displayHour}:${displayMinute} ${ampm}`;
  };

  if (!isOpen) {
    return null;
  }

  const esModoEdicion = medicamentoInicial !== null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>
            {esModoEdicion ? "Editar Medicamento" : "Agregar Medicamento"}
          </h3>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.modalBody}>
          <div style={styles.formScrollContainer}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre del Medicamento</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Paracetamol 500mg"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Dosis</label>
              <input
                type="text"
                name="dosis"
                value={formData.dosis}
                onChange={handleChange}
                placeholder="Ej. 1 cápsula"
                required
                style={styles.input}
              />
            </div>

            {/* SECCIÓN: HORAS FIJAS */}
            <div style={{ ...styles.formGroup, borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <label style={{...styles.label, fontWeight: 'bold'}}>Horas Fijas de Toma</label>
              <div style={styles.flexGroup}>
                <input
                  type="time"
                  value={nuevaHoraFija}
                  onChange={(e) => setNuevaHoraFija(e.target.value)}
                  style={{...styles.input, width: 'calc(50% - 6px)', margin: 0}}
                />
                <button
                  type="button"
                  onClick={handleAgregarHoraFija}
                  style={styles.primaryButton}
                >
                  + Agregar Hora
                </button>
              </div>
              
              <div style={styles.horasFijasContainer}>
                {formData.horasFijas.length === 0 ? (
                  <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>
                    Añadir la hora y presione "+ Agregar Hora".
                  </p>
                ) : (
                  formData.horasFijas.map((hora) => (
                    <span key={hora} style={styles.horaFijaTag}>
                      {formatTime(parseInt(hora.split(':')[0]), parseInt(hora.split(':')[1]))}
                      <button 
                        type="button" 
                        onClick={() => handleEliminarHoraFija(hora)} 
                        style={styles.removeButton}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* SECCIÓN: DURACIÓN DEL TRATAMIENTO CON FECHAS */}
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Duración del Tratamiento</h4>
              
              <div style={styles.dateRow}>
                <div style={styles.dateGroup}>
                  <label style={styles.label}>Fecha de Inicio</label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={formData.fechaInicio}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.dateGroup}>
                  <label style={styles.label}>Fecha de Fin</label>
                  <input
                    type="date"
                    name="fechaFin"
                    value={formData.fechaFin}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              {duracionCalculada && (
                <div style={styles.duracionDisplay}>
                  <p style={styles.duracionText}>
                    Duración: <strong>{duracionCalculada}</strong>
                  </p>
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Instrucciones Adicionales (Opcional)</label>
              <textarea
                name="instrucciones"
                value={formData.instrucciones}
                onChange={handleChange}
                rows="3"
                placeholder="Ej. Tomar después de los alimentos"
                style={styles.textarea}
              ></textarea>
            </div>
          </div>

          <div style={styles.formActions}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" style={styles.primaryButton}>
              {esModoEdicion ? "Guardar Cambios" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Estilos actualizados
const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    background: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e0e0e0',
    background: '#f8f9fa',
    flexShrink: 0,
  },
  modalTitle: {
    margin: 0,
    color: '#333',
    fontSize: '1.3rem',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: 0,
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  modalBody: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  formScrollContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    maxHeight: 'calc(90vh - 140px)',
  },
  formGroup: {
    marginBottom: '20px',
  },
  section: {
    marginBottom: '20px',
    padding: '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    background: '#fafafa',
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    color: '#333',
    fontSize: '1rem',
    fontWeight: '600',
  },
  dateRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '10px',
  },
  dateGroup: {
    flex: 1,
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500',
    color: '#333',
    fontSize: '0.95rem',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '80px',
  },
  duracionDisplay: {
    background: '#e8f5e8',
    padding: '10px 15px',
    borderRadius: '6px',
    borderLeft: '4px solid #28a745',
  },
  duracionText: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#155724',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    padding: '20px 24px',
    borderTop: '1px solid #e0e0e0',
    background: '#f8f9fa',
    flexShrink: 0,
  },
  primaryButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    background: '#007bff',
    color: 'white',
  },
  secondaryButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    background: '#6c757d',
    color: 'white',
  },
  // Estilos de Horas Fijas
  flexGroup: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '10px',
  },
  horasFijasContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '10px',
    padding: '10px',
    border: '1px dashed #ddd',
    borderRadius: '6px',
    minHeight: '40px',
    alignItems: 'center',
    background: '#f8f8f8',
  },
  horaFijaTag: {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#007bff20',
    color: '#0056b3',
    padding: '6px 10px',
    borderRadius: '15px',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    fontSize: '14px',
    cursor: 'pointer',
    marginLeft: '5px',
    padding: '0 3px',
    lineHeight: 1,
  },
};

// Estilos adicionales para la barra de scroll (simplificado)
const scrollbarStyles = `
  .form-scroll-container::-webkit-scrollbar {
    width: 6px;
  }
  .form-scroll-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  .form-scroll-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  .form-scroll-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

// Agregar estilos de scrollbar al documento (solo una vez)
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = scrollbarStyles;
  document.head.appendChild(styleElement);
}

export default ModalMedicamento;
