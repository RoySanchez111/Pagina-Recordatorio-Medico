import React, { useState, useEffect } from "react";
import "./App.css";

function ModalMedicamento({ isOpen, onClose, onSave, medicamentoInicial }) {
  const [formData, setFormData] = useState({
    nombre: "",
    dosis: "",
    frecuencia: "", // La paso a numero
    duracion: "",
    instrucciones: "",
    primeraIngesta: "", // Campo para la hora de la primera toma
  });

  useEffect(() => {
    if (isOpen && medicamentoInicial) {
      // Asegura que todos los campos estén definidos al editar
      setFormData({
        nombre: "",
        dosis: "",
        frecuencia: "",
        duracion: "",
        instrucciones: "",
        primeraIngesta: "",
        ...medicamentoInicial,
      });
    } else if (isOpen && !medicamentoInicial) {
      // Resetea el formulario completo
      setFormData({
        nombre: "",
        dosis: "",
        frecuencia: "",
        duracion: "",
        instrucciones: "",
        primeraIngesta: "",
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

  // Lógica para calcular horario

  // Convierte una hora (0-23) y minutos a formato 12-horas AM/PM

  const formatTime = (hour, minute) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    let displayHour = hour % 12;
    if (displayHour === 0) displayHour = 12;

    // Media noche especial
    if (hour === 0 && minute === 0) return "12:00 AM (Media Noche)";
    // Medio dia especial
    if (hour === 12 && minute === 0) return "12:00 PM (Medio Día)";

    const displayMinute = minute.toString().padStart(2, "0");
    return `${displayHour}:${displayMinute} ${ampm}`;
  };

  // Calcular los horarios basada en la hora de inicio y la frecuencia
  const calcularHorario = (primeraIngesta, frecuencia) => {
    const frecuenciaNum = parseInt(frecuencia, 10);

    // Validar que tengamos los datos necesarios
    if (!primeraIngesta || isNaN(frecuenciaNum) || frecuenciaNum <= 0) {
      return "";
    }

    // Compertir a numero entero la hora de inicio, ej "08:30" -> [8, 30]
    const [startHour, startMinute] = primeraIngesta.split(":").map(Number);

    // Formato de hora inválido
    if (isNaN(startHour) || isNaN(startMinute)) {
      return "";
    }

    let horarios = [];
    let currentHour = startHour;

    // Bucle para calcular los horarios en un ciclo de 24h
    while (true) {
      // Añadir la hora actual formateada
      horarios.push(formatTime(currentHour, startMinute));

      // Calcular la siguiente hora
      currentHour = (currentHour + frecuenciaNum) % 24;

      // Si la siguiente hora es la misma que la de inicio, completamos el ciclo
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

  // Calcula el horario en cada render
  const horarioCalculado = calcularHorario(
    formData.primeraIngesta,
    formData.frecuencia
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            {esModoEdicion ? "Editar Medicamento" : "Agregar Medicamento"}
          </h3>
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

          {/* CAMPO FRECUENCIA MODIFICADO */}
          <div className="form-group">
            <label>Frecuencia (en horas)</label>
            <input
              type="number"
              name="frecuencia"
              value={formData.frecuencia}
              onChange={handleChange}
              placeholder="Ej. 8"
              min="1"
              required
            />
          </div>

          {/* NUEVO CAMPO PRIMERA INGESTA */}
          <div className="form-group">
            <label>Primera Ingesta</label>
            <input
              type="time"
              name="primeraIngesta"
              value={formData.primeraIngesta}
              onChange={handleChange}
              required
            />
          </div>

          {/* VISUALIZADOR DEL HORARIO CALCULADO */}
          {horarioCalculado && (
            <div className="horario-calculado-display">
              <p>Horarios de toma:</p>
              <p>
                <strong>{horarioCalculado}</strong>
              </p>
            </div>
          )}

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
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {esModoEdicion ? "Guardar Cambios" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalMedicamento;
