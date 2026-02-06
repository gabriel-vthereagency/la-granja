import { useState, useEffect, useRef } from 'react'

interface ConfirmButtonProps {
  onConfirm: () => void
  label: string
  confirmLabel?: string
  className?: string
  confirmClassName?: string
  disabled?: boolean
}

export function ConfirmButton({
  onConfirm,
  label,
  confirmLabel = '¿Confirmar?',
  className = '',
  confirmClassName = '',
  disabled = false,
}: ConfirmButtonProps) {
  const [pending, setPending] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleClick = () => {
    if (disabled) return

    if (pending) {
      // Segundo click - confirmar
      setPending(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      onConfirm()
    } else {
      // Primer click - mostrar confirmación
      setPending(true)
      timeoutRef.current = window.setTimeout(() => {
        setPending(false)
      }, 3000) // 3 segundos para confirmar
    }
  }

  const handleBlur = () => {
    // Cancelar si pierde foco
    setPending(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  return (
    <button
      onClick={handleClick}
      onBlur={handleBlur}
      disabled={disabled}
      className={pending ? confirmClassName || className : className}
    >
      {pending ? confirmLabel : label}
    </button>
  )
}
