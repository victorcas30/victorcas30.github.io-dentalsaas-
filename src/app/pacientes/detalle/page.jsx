'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import ConfirmModal from '@/components/ConfirmModal'
import { pacientesService } from '@/services/pacientesService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI, mostrarExito } from '@/utils/sweetAlertHelper'

function DetallePacienteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idPaciente = searchParams.get('id')
  const idClinica = authService.getClinicaId()

  const [paciente, setPaciente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModalEditar, setShowModalEditar] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [etiquetas, setEtiquetas] = useState([])
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([])
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    sexo: 'M',
    fecha_nacimiento: '',
    dui: '',
    celular_whatsapp: '',
    telefono_secundario: '',
    email: '',
    direccion: '',
    nombre_contacto: '',
    telefono_contacto: '',
    es_paciente: true,
    consiente_tratamiento_datos: true
  })

  useEffect(() => {
    if (idPaciente) {
      cargarPaciente()
      cargarEtiquetas()
    }
  }, [idPaciente])

  const cargarEtiquetas = async () => {
    try {
      const etiquetasService = await import('@/services/etiquetasService').then(m => m.etiquetasService)
      const data = await etiquetasService.listarPorClinica(idClinica)
      setEtiquetas(data)
    } catch (err) {
      console.error('Error al cargar etiquetas:', err)
    }
  }

  const cargarPaciente = async () => {
    try {
      setLoading(true)
      const data = await pacientesService.obtenerPorId(idPaciente, idClinica)
      setPaciente(data)
    } catch (err) {
      console.error('Error al cargar paciente:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible'
    const date = new Date(fecha)
    return date.toLocaleDateString('es-SV', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A'
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return `${edad} años`
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const abrirModalEditar = () => {
    const fechaNacimiento = paciente.fecha_nacimiento ? paciente.fecha_nacimiento.split('T')[0] : ''
    
    setFormData({
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      sexo: paciente.sexo,
      fecha_nacimiento: fechaNacimiento,
      dui: paciente.dui || '',
      celular_whatsapp: paciente.celular_whatsapp,
      telefono_secundario: paciente.telefono_secundario || '',
      email: paciente.email || '',
      direccion: paciente.direccion || '',
      nombre_contacto: paciente.nombre_contacto || '',
      telefono_contacto: paciente.telefono_contacto || '',
      es_paciente: paciente.es_paciente,
      consiente_tratamiento_datos: paciente.consiente_tratamiento_datos
    })
    const etiquetasAsignadas = paciente.etiquetas?.filter(e => e.asignada).map(e => e.id_etiqueta) || []
    setEtiquetasSeleccionadas(etiquetasAsignadas)
    setShowModalEditar(true)
  }

  const handleEtiquetaToggle = (idEtiqueta) => {
    setEtiquetasSeleccionadas(prev => {
      if (prev.includes(idEtiqueta)) {
        return prev.filter(id => id !== idEtiqueta)
      } else {
        return [...prev, idEtiqueta]
      }
    })
  }

  const cerrarModalEditar = () => {
    setShowModalEditar(false)
  }

  const handleSubmitEditar = async (e) => {
    e.preventDefault()
    setLoadingAction(true)

    try {
      await pacientesService.actualizar(idPaciente, idClinica, formData)
      
      const etiquetasPacienteService = await import('@/services/etiquetasPacienteService').then(m => m.etiquetasPacienteService)
      const etiquetasOriginales = paciente.etiquetas?.filter(e => e.asignada).map(e => e.id_etiqueta) || []
      
      const etiquetasAgregar = etiquetasSeleccionadas.filter(id => !etiquetasOriginales.includes(id))
      for (const idEtiqueta of etiquetasAgregar) {
        await etiquetasPacienteService.asignar(idPaciente, idEtiqueta, idClinica)
      }
      
      const etiquetasRemover = etiquetasOriginales.filter(id => !etiquetasSeleccionadas.includes(id))
      for (const idEtiqueta of etiquetasRemover) {
        await etiquetasPacienteService.desasignar(idPaciente, idEtiqueta, idClinica)
      }
      
      await mostrarExito('Paciente actualizado exitosamente')
      await cargarPaciente()
      cerrarModalEditar()
    } catch (err) {
      console.error('Error al actualizar paciente:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingAction(false)
    }
  }

  const confirmarEliminar = () => {
    setShowConfirmDelete(true)
  }

  const eliminarPaciente = async () => {
    try {
      await pacientesService.eliminar(idPaciente, idClinica)
      await mostrarExito('Paciente eliminado exitosamente')
      router.push('/pacientes')
    } catch (err) {
      console.error('Error al eliminar paciente:', err)
      await mostrarErrorAPI(err)
    } finally {
      setShowConfirmDelete(false)
    }
  }

  if (!idPaciente) {
    return (
      <HorizontalLayout>
        <div className="text-center py-5">
          <i className="ti ti-alert-circle" style={{fontSize: '64px', color: '#ccc'}}></i>
          <h4 className="mt-3">ID de paciente no especificado</h4>
          <button className="btn btn-primary mt-3" onClick={() => router.push('/pacientes')}>
            Volver a Pacientes
          </button>
        </div>
      </HorizontalLayout>
    )
  }

  if (loading) {
    return (
      <HorizontalLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-3 text-muted">Cargando información del paciente...</p>
        </div>
      </HorizontalLayout>
    )
  }

  if (!paciente) {
    return (
      <HorizontalLayout>
        <div className="text-center py-5">
          <i className="ti ti-user-off" style={{fontSize: '64px', color: '#ccc'}}></i>
          <h4 className="mt-3">Paciente no encontrado</h4>
          <button className="btn btn-primary mt-3" onClick={() => router.push('/pacientes')}>
            Volver a Pacientes
          </button>
        </div>
      </HorizontalLayout>
    )
  }

  return (
    <HorizontalLayout>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <button 
            className="btn btn-sm btn-outline-secondary mb-3" 
            onClick={() => router.push('/pacientes')}
          >
            <i className="ti ti-arrow-left me-2"></i>Volver a Pacientes
          </button>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                   style={{width: '64px', height: '64px', fontSize: '24px'}}>
                <i className="ti ti-user"></i>
              </div>
              <div>
                <h2 className="fw-bold mb-1">
                  {paciente.nombres} {paciente.apellidos}
                </h2>
                <div className="d-flex gap-2 flex-wrap">
                  {paciente.etiquetas?.map(etiqueta => (
                    <span 
                      key={etiqueta.id_etiqueta}
                      className="badge"
                      style={{
                        backgroundColor: etiqueta.color,
                        color: '#fff'
                      }}
                    >
                      {etiqueta.nombre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <button className="btn btn-primary me-2" onClick={abrirModalEditar}>
                <i className="ti ti-edit me-2"></i>Editar
              </button>
              <button className="btn btn-outline-danger" onClick={confirmarEliminar}>
                <i className="ti ti-trash me-2"></i>Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resto del componente igual... */}
      {/* Modal Editar, Cards de información, etc. */}
      
      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        show={showConfirmDelete}
        onConfirm={eliminarPaciente}
        onCancel={() => setShowConfirmDelete(false)}
        title="¿Estás seguro?"
        message={`¿Deseas eliminar al paciente "${paciente?.nombres} ${paciente?.apellidos}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmColor="danger"
        icon="ti ti-alert-triangle"
      />

      <div className="row">
        {/* Cards de información del paciente */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <p className="text-muted">Información del paciente se mostrará aquí...</p>
            </div>
          </div>
        </div>
      </div>
    </HorizontalLayout>
  )
}

export default function DetallePaciente() {
  return (
    <Suspense fallback={
      <HorizontalLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-3 text-muted">Cargando...</p>
        </div>
      </HorizontalLayout>
    }>
      <DetallePacienteContent />
    </Suspense>
  )
}
