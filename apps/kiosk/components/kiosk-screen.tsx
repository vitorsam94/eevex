'use client'

import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

type KioskState =
  | { phase: 'idle' }
  | { phase: 'scanning' }
  | { phase: 'loading' }
  | { phase: 'success'; name: string; ticketType: string }
  | { phase: 'already_used' }
  | { phase: 'invalid' }
  | { phase: 'type_restricted' }
  | { phase: 'cancelled' }

const TIMEOUT_MS = 10_000

export function KioskScreen() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const lastTokenRef = useRef('')

  const [state, setState] = useState<KioskState>({ phase: 'idle' })
  const [kioskToken] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('kiosk_token') ?? '' : '',
  )

  function resetToIdle() {
    setState({ phase: 'idle' })
    lastTokenRef.current = ''
    startScanning()
  }

  function scheduleReset() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(resetToIdle, TIMEOUT_MS)
  }

  async function validateToken(token: string) {
    if (token === lastTokenRef.current) return
    lastTokenRef.current = token
    setState({ phase: 'loading' })

    try {
      const res = await fetch('/api/checkin/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${kioskToken}`,
        },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      setState(data.status === 'success'
        ? { phase: 'success', name: data.participant.name, ticketType: data.participant.ticketType }
        : { phase: data.status as KioskState['phase'] })
    } catch {
      setState({ phase: 'invalid' })
    }
    scheduleReset()
  }

  function scanFrame() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }
    const ctx = canvas.getContext('2d')!
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imgData.data, imgData.width, imgData.height)
    if (code?.data) {
      validateToken(code.data)
      return
    }
    rafRef.current = requestAnimationFrame(scanFrame)
  }

  async function startScanning() {
    setState({ phase: 'scanning' })
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        scanFrame()
      }
    } catch {
      setState({ phase: 'idle' })
    }
  }

  useEffect(() => {
    startScanning()
    return () => {
      cancelAnimationFrame(rafRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const { phase } = state

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden bg-bg">
      {/* Background camera feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center">
        {phase === 'idle' && (
          <>
            <div className="h-32 w-32 rounded-2xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
              <span className="text-5xl">📲</span>
            </div>
            <div>
              <h1 className="font-heading text-4xl font-semibold text-fg">Bem-vindo!</h1>
              <p className="text-fg-muted text-xl mt-2">Clique para iniciar o check-in</p>
            </div>
            <button
              onClick={startScanning}
              className="h-14 px-10 rounded-xl bg-primary text-white font-heading font-semibold text-lg hover:bg-primary/90 transition-colors"
            >
              Iniciar check-in
            </button>
          </>
        )}

        {phase === 'scanning' && (
          <>
            <div className="h-64 w-64 rounded-2xl border-2 border-primary/60 relative flex items-center justify-center">
              <div className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
              <div className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
              <div className="h-0.5 w-full bg-primary/70 animate-bounce" />
            </div>
            <p className="font-heading text-2xl text-fg">Aponte o QR Code do ingresso</p>
          </>
        )}

        {phase === 'loading' && (
          <div className="text-center">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
            <p className="text-fg-muted mt-4">Validando...</p>
          </div>
        )}

        {phase === 'success' && 'name' in state && (
          <div className="space-y-6 animate-in fade-in">
            <div className="h-24 w-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
              <span className="text-5xl">✅</span>
            </div>
            <div>
              <h1 className="font-heading text-4xl font-bold text-fg">{state.name}</h1>
              <p className="text-accent text-xl mt-2">{state.ticketType}</p>
              <p className="text-fg-muted mt-2">Check-in realizado com sucesso!</p>
            </div>
          </div>
        )}

        {phase === 'already_used' && (
          <div className="space-y-4">
            <span className="text-6xl">🚫</span>
            <h1 className="font-heading text-3xl font-semibold text-danger">Já utilizado</h1>
            <p className="text-fg-muted text-lg">Este ingresso já foi utilizado.</p>
            <p className="text-fg-dim">Procure a recepção para ajuda.</p>
          </div>
        )}

        {(phase === 'invalid' || phase === 'cancelled') && (
          <div className="space-y-4">
            <span className="text-6xl">❌</span>
            <h1 className="font-heading text-3xl font-semibold text-danger">
              {phase === 'cancelled' ? 'Ingresso cancelado' : 'Ingresso inválido'}
            </h1>
            <p className="text-fg-muted text-lg">Procure a recepção para ajuda.</p>
          </div>
        )}

        {phase === 'type_restricted' && (
          <div className="space-y-4">
            <span className="text-6xl">🔒</span>
            <h1 className="font-heading text-3xl font-semibold text-warn">Atendimento especial</h1>
            <p className="text-fg-muted text-lg">
              Este ingresso requer atendimento na recepção.
            </p>
          </div>
        )}

        {['success', 'already_used', 'invalid', 'type_restricted', 'cancelled'].includes(phase) && (
          <p className="text-xs text-fg-dim animate-pulse">
            Voltando automaticamente em {TIMEOUT_MS / 1000}s...
          </p>
        )}
      </div>
    </div>
  )
}
