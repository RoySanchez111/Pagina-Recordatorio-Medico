import React, { useState, useEffect } from "react";
import "./App.css";

function ModalMedicamento({ isOpen, onClose, onSave, medicamentoInicial }) {
  const [formData, setFormData] = useState({
    nombre: "",
    dosis: "",
    frecuencia: "",
    duracion: "",
    instrucciones: "",
    primeraIngesta: "",
    cantidadInicial: "",
  });

  useEffect(() => {
    if (isOpen && medicamentoInicial) {
      setFormData({
        nombre: "",
        dosis: "",
        frecuencia: "",
        duracion: "",
        instrucciones: "",
        primeraIngesta: "",
        cantidadInicial: "",
        ...medicamentoInicial,
      });
    } else if (isOpen && !medicamentoInicial) {
      setFormData({
        nombre: "",
        dosis: "",
        frecuencia: "",
        duracion: "",
        instrucciones: "",
        primeraIngesta: "",
        cantidadInicial: "",
      });
    }
  }, [isOpen, medicamentoInicial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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

  const calcularHorario = (primeraIngesta, frecuencia) => {
    const frecuenciaNum = parseInt(frecuencia, 10);

    if (!primeraIngesta || isNaN(frecuenciaNum) || frecuenciaNum <= 0) {
      return "";
    }

    const [startHour, startMinute] = primeraIngesta.split(":").map(Number);

    if (isNaN(startHour) || isNaN(startMinute)) {
      return "";
    }

    let horarios = [];
    let currentHour = startHour;

    while (true) {
      horarios.push(formatTime(currentHour, startMinute));
      currentHour = (currentHour + frecuenciaNum) % 24;
      if (currentHour === startHour) {
        break;
      }
    }

    return horarios.join(" - ");
  };

  if (!isOpen) {
    return null;
  }

  const esModoEdicion = medicamentoInicial !== null;
  const horarioCalculado = calcularHorario(
    formData.primeraIngesta,
    formData.frecuencia
  );

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

            <div style={styles.formGroup}>
              <label style={styles.label}>Cantidad Inicial de Medicamentos</label>
              <input
                type="number"
                name="cantidadInicial"
                value={formData.cantidadInicial}
                onChange={handleChange}
                placeholder="Ej. 20"
                min="1"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Frecuencia (en horas)</label>
              <input
                type="number"
                name="frecuencia"
                value={formData.frecuencia}
                onChange={handleChange}
                placeholder="Ej. 8"
                min="1"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Primera Ingesta</label>
              <input
                type="time"
                name="primeraIngesta"
                value={formData.primeraIngesta}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            {horarioCalculado && (
              <div style={styles.horarioDisplay}>
                <p style={styles.horarioText}>Horarios de toma:</p>
                <p style={styles.horarioText}>
                  <strong style={styles.horarioStrong}>{horarioCalculado}</strong>
                </p>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Duración del Tratamiento</label>
              <input
                type="text"
                name="duracion"
                value={formData.duracion}
                onChange={handleChange}
                placeholder="Ej. 7 días"
                required
                style={styles.input}
              />
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

// Estilos en línea
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
    // Estilos para la barra de scroll
    scrollbarWidth: 'thin',
    scrollbarColor: '#c1c1c1 #f1f1f1',
  },
  formGroup: {
    marginBottom: '20px',
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
  horarioDisplay: {
    background: '#e8f4ff',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
    borderLeft: '4px solid #007bff',
  },
  horarioText: {
    margin: 0,
    fontSize: '0.9rem',
  },
  horarioStrong: {
    color: '#007bff',
    fontSize: '0.95rem',
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
};

// Estilos adicionales para la barra de scroll en navegadores WebKit
const styleSheet = document.styleSheets[0];
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

// Agregar estilos de scrollbar al documento
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = scrollbarStyles;
  document.head.appendChild(styleElement);
}

export default ModalMedicamento;
