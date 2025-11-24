import React, { useState, useEffect } from "react";
import "./App.css";

function ModalMedicamento({ isOpen, onClose, onSave, medicamentoInicial }) {
  const [formData, setFormData] = useState({
    nombre: "",
    dosisCantidad: "",
    dosisUnidad: "capsula",
    dosisPersonalizada: "",
    fechaInicio: "",
    fechaFin: "",
    instrucciones: "",
    tipoHorario: "Fijo",
    horasFijas: [],
    frecuenciaHoras: "",
    duracionTratamiento: "",
    unidadDuracion: "dias"
  });

  const [nuevaHoraFija, setNuevaHoraFija] = useState("08:00");
  const [duracionCalculada, setDuracionCalculada] = useState("");
  const [horasCalculadas, setHorasCalculadas] = useState([]);
  const [usarDosisPersonalizada, setUsarDosisPersonalizada] = useState(false);

  // Opciones predefinidas para dosis
  const opcionesDosis = [
    { value: "capsula", label: "Cápsula(s)" },
    { value: "tableta", label: "Tableta(s)" },
    { value: "pastilla", label: "Pastilla(s)" },
    { value: "comprimido", label: "Comprimido(s)" },
    { value: "cucharadita", label: "Cucharadita(s)" },
    { value: "cucharada", label: "Cucharada(s)" },
    { value: "mililitro", label: "Mililitro(s)" },
    { value: "gramo", label: "Gramo(s)" },
    { value: "mg", label: "Miligramo(s)" },
    { value: "gota", label: "Gota(s)" },
    { value: "inyeccion", label: "Inyección(es)" },
    { value: "aplicacion", label: "Aplicación(es)" },
    { value: "puff", label: "Puff(s)" },
    { value: "unidad", label: "Unidad(es)" }
  ];

  useEffect(() => {
    if (isOpen) {
      const defaultState = {
        nombre: "",
        dosisCantidad: "",
        dosisUnidad: "capsula",
        dosisPersonalizada: "",
        fechaInicio: "",
        fechaFin: "",
        instrucciones: "",
        tipoHorario: "Fijo",
        horasFijas: [],
        frecuenciaHoras: "",
        duracionTratamiento: "",
        unidadDuracion: "dias"
      };

      if (medicamentoInicial) {
        setFormData({
          ...defaultState,
          ...medicamentoInicial,
          horasFijas: medicamentoInicial.horasFijas || [],
          tipoHorario: "Fijo"
        });
        // Verificar si estaba usando dosis personalizada
        if (medicamentoInicial.dosisPersonalizada) {
          setUsarDosisPersonalizada(true);
        }
      } else {
        setFormData(defaultState);
        setUsarDosisPersonalizada(false);
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

  // Calcular horas basadas en la frecuencia
  useEffect(() => {
    if (formData.frecuenciaHoras && formData.horasFijas.length > 0) {
      calcularHorasPorFrecuencia();
    } else {
      setHorasCalculadas([]);
    }
  }, [formData.frecuenciaHoras, formData.horasFijas]);

  const calcularHorasPorFrecuencia = () => {
    const frecuencia = parseInt(formData.frecuenciaHoras);
    if (!frecuencia || frecuencia <= 0) {
      setHorasCalculadas([]);
      return;
    }

    const nuevasHoras = [];
    
    // Tomar la primera hora fija como referencia
    const horaBase = formData.horasFijas[0];
    const [horaBaseNum, minutoBaseNum] = horaBase.split(':').map(Number);
    
    // Calcular las siguientes 3 tomas basadas en la frecuencia
    for (let i = 1; i <= 3; i++) {
      const nuevaHoraTotal = horaBaseNum + (frecuencia * i);
      const nuevaHora = nuevaHoraTotal % 24;
      const nuevaHoraStr = nuevaHora.toString().padStart(2, '0');
      const nuevoMinutoStr = minutoBaseNum.toString().padStart(2, '0');
      
      nuevasHoras.push(`${nuevaHoraStr}:${nuevoMinutoStr}`);
    }
    
    setHorasCalculadas(nuevasHoras);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validar que duracionTratamiento solo acepte números y máximo 2 dígitos
    if (name === "duracionTratamiento") {
      // Solo permitir números y máximo 2 dígitos
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 2);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } 
    // Validar que dosisCantidad solo acepte números
    else if (name === "dosisCantidad") {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    }
    else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleDosisPersonalizada = () => {
    setUsarDosisPersonalizada(!usarDosisPersonalizada);
    if (!usarDosisPersonalizada) {
      // Al activar dosis personalizada, limpiar los campos predefinidos
      setFormData(prev => ({
        ...prev,
        dosisCantidad: "",
        dosisUnidad: "capsula"
      }));
    } else {
      // Al desactivar dosis personalizada, limpiar el campo personalizado
      setFormData(prev => ({
        ...prev,
        dosisPersonalizada: ""
      }));
    }
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

    // Validar dosis
    if (!usarDosisPersonalizada && (!formData.dosisCantidad || !formData.dosisUnidad)) {
      alert("Por favor, complete la información de dosis.");
      return;
    }

    if (usarDosisPersonalizada && !formData.dosisPersonalizada) {
      alert("Por favor, complete la dosis personalizada.");
      return;
    }

    // Preparar datos para guardar
    const datosCompletos = {
      ...formData,
      duracion: duracionCalculada,
      horasCalculadas: horasCalculadas,
      // Incluir dosis formateada
      dosis: usarDosisPersonalizada 
        ? formData.dosisPersonalizada 
        : `${formData.dosisCantidad} ${opcionesDosis.find(op => op.value === formData.dosisUnidad)?.label || formData.dosisUnidad}`
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

            {/* SECCIÓN MODIFICADA: DOSIS */}
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Dosis</h4>
              
              <div style={styles.dosisOptions}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    checked={!usarDosisPersonalizada}
                    onChange={toggleDosisPersonalizada}
                    style={styles.radioInput}
                  />
                  Dosis predefinida
                </label>
                
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    checked={usarDosisPersonalizada}
                    onChange={toggleDosisPersonalizada}
                    style={styles.radioInput}
                  />
                  Dosis personalizada
                </label>
              </div>

              {!usarDosisPersonalizada ? (
                <div style={styles.dosisPredefinida}>
                  <div style={styles.dosisRow}>
                    <div style={styles.dosisCantidadGroup}>
                      <label style={styles.sublabel}>Cantidad</label>
                      <input
                        type="text"
                        name="dosisCantidad"
                        value={formData.dosisCantidad}
                        onChange={handleChange}
                        placeholder="1"
                        maxLength={2}
                        pattern="[0-9]*"
                        required
                        style={styles.input}
                      />
                    </div>
                    
                    <div style={styles.dosisUnidadGroup}>
                      <label style={styles.sublabel}>Unidad</label>
                      <select
                        name="dosisUnidad"
                        value={formData.dosisUnidad}
                        onChange={handleChange}
                        style={styles.select}
                        required
                      >
                        {opcionesDosis.map((opcion) => (
                          <option key={opcion.value} value={opcion.value}>
                            {opcion.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {formData.dosisCantidad && formData.dosisUnidad && (
                    <div style={styles.dosisPreview}>
                      <p style={styles.dosisPreviewText}>
                        Dosis: <strong>{formData.dosisCantidad} {opcionesDosis.find(op => op.value === formData.dosisUnidad)?.label}</strong>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.dosisPersonalizada}>
                  <label style={styles.sublabel}>Descripción de la dosis</label>
                  <input
                    type="text"
                    name="dosisPersonalizada"
                    value={formData.dosisPersonalizada}
                    onChange={handleChange}
                    placeholder="Ej. 10 ml cada 8 horas, media tableta, etc."
                    required
                    style={styles.input}
                  />
                </div>
              )}
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

            {/* SECCIÓN: HORAS POR FRECUENCIA */}
            <div style={{ ...styles.formGroup, borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <label style={{...styles.label, fontWeight: 'bold'}}>Horas por Frecuencia</label>
              
              <div style={styles.flexGroup}>
                <div style={{flex: 1}}>
                  <label style={styles.sublabel}>Frecuencia (cada cuántas horas)</label>
                  <input
                    type="number"
                    name="frecuenciaHoras"
                    value={formData.frecuenciaHoras}
                    onChange={handleChange}
                    placeholder="Ej. 8 (cada 8 horas)"
                    min="1"
                    max="24"
                    style={styles.input}
                  />
                </div>
              </div>

              {horasCalculadas.length > 0 && (
                <div style={styles.horasCalculadasContainer}>
                  <p style={styles.horasCalculadasTitle}>Próximas tomas calculadas:</p>
                  <div style={styles.horasCalculadasList}>
                    {horasCalculadas.map((hora, index) => (
                      <span key={index} style={styles.horaCalculadaTag}>
                        {formatTime(parseInt(hora.split(':')[0]), parseInt(hora.split(':')[1]))}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN: DURACIÓN DEL TRATAMIENTO */}
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Duración del Tratamiento</h4>
              
              <div style={styles.duracionRow}>
                <div style={styles.duracionGroup}>
                  <label style={styles.label}>Duración</label>
                  <input
                    type="text"
                    name="duracionTratamiento"
                    value={formData.duracionTratamiento}
                    onChange={handleChange}
                    placeholder="Ej. 7"
                    maxLength={2}
                    pattern="[0-9]*"
                    required
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.unidadGroup}>
                  <label style={styles.label}>Unidad</label>
                  <select
                    name="unidadDuracion"
                    value={formData.unidadDuracion}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="dias">Días</option>
                    <option value="semanas">Semanas</option>
                    <option value="meses">Meses</option>
                  </select>
                </div>
              </div>

              {formData.duracionTratamiento && formData.unidadDuracion && (
                <div style={styles.duracionInfo}>
                  <p style={styles.duracionInfoText}>
                    Tratamiento por {formData.duracionTratamiento} {formData.unidadDuracion}
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
  // Estilos para dosis
  dosisOptions: {
    display: 'flex',
    gap: '20px',
    marginBottom: '15px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  radioInput: {
    margin: 0,
  },
  dosisPredefinida: {
    marginTop: '10px',
  },
  dosisPersonalizada: {
    marginTop: '10px',
  },
  dosisRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '10px',
  },
  dosisCantidadGroup: {
    flex: 1,
  },
  dosisUnidadGroup: {
    flex: 2,
  },
  dosisPreview: {
    background: '#e8f5e8',
    padding: '10px 15px',
    borderRadius: '6px',
    borderLeft: '4px solid #28a745',
  },
  dosisPreviewText: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#155724',
  },
  // Estilos para duración
  duracionRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '10px',
  },
  duracionGroup: {
    flex: 2,
  },
  unidadGroup: {
    flex: 1,
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    background: 'white',
  },
  duracionInfo: {
    background: '#e8f5e8',
    padding: '10px 15px',
    borderRadius: '6px',
    borderLeft: '4px solid #28a745',
  },
  duracionInfoText: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#155724',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500',
    color: '#333',
    fontSize: '0.95rem',
  },
  sublabel: {
    display: 'block',
    marginBottom: '4px',
    fontWeight: '400',
    color: '#666',
    fontSize: '0.85rem',
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
  // Estilos para horas calculadas por frecuencia
  horasCalculadasContainer: {
    marginTop: '15px',
    padding: '12px',
    background: '#f0f8ff',
    border: '1px solid #b3d9ff',
    borderRadius: '6px',
  },
  horasCalculadasTitle: {
    margin: '0 0 8px 0',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#0066cc',
  },
  horasCalculadasList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  horaCalculadaTag: {
    display: 'inline-block',
    background: '#0066cc20',
    color: '#004d99',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
};

// Estilos adicionales para la barra de scroll
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