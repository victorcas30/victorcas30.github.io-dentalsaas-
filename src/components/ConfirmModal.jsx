'use client'

import { useState } from 'react'

export default function ConfirmModal({ 
  show, 
  onConfirm, 
  onCancel, 
  title = '¿Estás seguro?',
  message,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  confirmColor = 'danger',
  icon = 'ti ti-alert-triangle'
}) {
  if (!show) return null

  return (
    <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060}}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body text-center py-5">
            {/* Icono */}
            <div className="mb-4">
              <div 
                className={`rounded-circle d-inline-flex align-items-center justify-content-center bg-${confirmColor}-subtle`}
                style={{width: '80px', height: '80px'}}
              >
                <i className={`${icon} text-${confirmColor}`} style={{fontSize: '48px'}}></i>
              </div>
            </div>

            {/* Título */}
            <h3 className="fw-bold mb-3">{title}</h3>

            {/* Mensaje */}
            <p className="text-muted mb-0">{message}</p>
          </div>

          <div className="modal-footer justify-content-center border-0 pt-0">
            <button 
              type="button" 
              className="btn btn-light px-4"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button 
              type="button" 
              className={`btn btn-${confirmColor} px-4`}
              onClick={onConfirm}
            >
              <i className="ti ti-trash me-2"></i>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
