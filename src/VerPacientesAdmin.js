import React, { useEffect, useState } from "react";
import "./App.css";
import usuariosAzul from "./assets/usuarios-azul.png";

const API_URL = "https://a6p5u37ybkzmvauf4lko6j3yda0qgkcb.lambda-url.us-east-1.on.aws/";

function VerPacientesAdmin() {
  const [pacientes, setPacientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal eliminar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pacienteAEliminar, setPacienteAEliminar] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState(null);

  useEffect(() => {
    const cargarPacientesAdmin = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1) Traer TODOS los usuarios
        const respUsers = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "getAllUsers",
            data: {},
          }),
        });

        const dataUsers = await respUsers.json();

        if (!respUsers.ok) {
          throw new Error(dataUsers.message || "No se pudieron cargar los usuarios.");
        }

        const usuarios = Array.isArray(dataUsers) ? dataUsers : [];

        // 2) Filtrar solo doctores
        const doctores = usuarios.filter(
          (u) => u.rol && u.rol.toLowerCase() === "doctor"
        );

        // 3) Para cada doctor, pedir sus pacientes
        const listasPorDoctor = await Promise.all(
          doctores.map(async (doc) => {
            try {
              const respPac = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "getPatientsByDoctor",
                  data: { doctorId: doc.id },
                }),
              });

              const dataPac = await respPac.json();

              if (!respPac.ok) {
                console.warn(
                  "Error al traer pacientes del doctor",
                  doc.id,
                  dataPac.message
                );
                return [];
              }

              const listaPac = Array.isArray(dataPac) ? dataPac : [];

              // Adjuntamos datos del doctor a cada paciente
              return listaPac.map((p) => ({
                ...p,
                doctorNombre: doc.nombreCompleto,
                doctorId: doc.id,
              }));
            } catch (e) {
              console.warn("Error en getPatientsByDoctor para", doc.id, e);
              return [];
            }
          })
        );

        // 4) Aplanar y eliminar duplicados por ID
        const todosPacientes = listasPorDoctor.flat();
        const mapa = new Map();
        for (const p of todosPacientes) {
          if (!mapa.has(p.id)) {
            mapa.set(p.id, p);
          }
        }

        const listaFinal = Array.from(mapa.values()).sort((a, b) =>
          (a.nombreCompleto || "").localeCompare(b.nombreCompleto || "")
        );

        setPacientes(listaFinal);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    cargarPacientesAdmin();
  }, []);

  // Abrir/cerrar modal
  const handleOpenModal = (paciente) => {
    setPacienteAEliminar(paciente);
    setDeleteStatus(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPacienteAEliminar(null);
  };

  // Confirmar eliminar (usa la misma action que el doctor)
  const handleConfirmarEliminar = async () => {
    if (!pacienteAEliminar) return;

    try {
      const payload = {
        action: "deletePatient",
        data: { pacienteId: pacienteAEliminar.id },
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al eliminar el paciente.");
      }

      setPacientes((prev) =>
        prev.filter((p) => p.id !== pacienteAEliminar.id)
      );
      setDeleteStatus("success");
    } catch (err) {
      setDeleteStatus("error");
      setError(err.message);
    } finally {
      handleCloseModal();
    }
  };

  // ESTADOS UI
  if (isLoading) {
    return (
      <div className="usuarios-container">
        <h2 className="page-title">
          <img src={usuariosAzul} alt="Pacientes" />
          Ver pacientes
        </h2>
        <p className="loading-message">Cargando pacientes...</p>
      </div>
    );
  }

  if (error && !deleteStatus) {
    return (
      <div className="usuarios-container">
        <h2 className="page-title">
          <img src={usuariosAzul} alt="Pacientes" />
          Ver pacientes
        </h2>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="usuarios-container">
      <h2 className="page-title">
        <img src={usuariosAzul} alt="Pacientes" />
        Ver pacientes
      </h2>

      {deleteStatus === "success" && (
        <div className="status-message success">
          ¡Paciente eliminado con éxito!
        </div>
      )}
      {deleteStatus === "error" && (
        <div className="status-message error">
          Error al eliminar el paciente.
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre completo</th>
              <th>Doctor asignado</th>
              <th>Teléfono</th>
              <th>Alergias</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No hay pacientes registrados.
                </td>
              </tr>
            )}

            {pacientes.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombreCompleto}</td>
                <td>{p.doctorNombre || "Sin doctor"}</td>
                <td>{p.telefono || "N/A"}</td>
                <td>{p.alergias || "N/A"}</td>
                <td>
                  <button
                    className="btn-eliminar"
                    onClick={() => handleOpenModal(p)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal confirmación */}
      {isModalOpen && pacienteAEliminar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Confirmar eliminación</h3>
            <div className="modal-body">
              <p>
                ¿Seguro que deseas eliminar al paciente
                <strong className="user-name-highlight">
                  {" "}{pacienteAEliminar.nombreCompleto}{" "}
                </strong>
                con ID
                <code className="user-id-highlight">
                  {" "}{pacienteAEliminar.id}{" "}
                </code>
                ?
              </p>
              <p className="warning-text">Esta acción es irreversible.</p>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button
                className="modal-confirm-btn"
                onClick={handleConfirmarEliminar}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerPacientesAdmin;
 