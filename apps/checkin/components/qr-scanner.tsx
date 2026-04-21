'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import jsQR from 'jsqr'
import { Button, Badge } from '@eevex/ui'
import { ScanLine, UserSearch, Wifi, WifiOff } from 'lucide-react'

type ScanResult =
  | { status: 'success'; participant: { name: string; ticketType: string; orderCode: string } }
  | { status: 'already_used'; checkedInAt: string }
  | { status: 'invalid' }
  | { status: 'cancelled' }
  | null

export function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const lastScanRef = useRef<string>('')

  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult>(null)
  const [loading, setLoading] = useState(false)
  const [online, setOnline] = useState(true)
  const [manualMode, setManualMode] = useState(false)
  const [manualQuery, setManualQuery] = useState('')

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setScanning(true)
        scanFrame()
      }
    } catch {
      alert('Câmera não disponível. Use a busca manual.')
      setManualMode(true)
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current)
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach((t) => t.stop())
    setScanning(false)
  }

  const validateToken = useCallback(async (token: string) => {
    if (loading || token === lastScanRef.current) return
    lastScanRef.current = token
    setLoading(true)
    try {
      const res = await fetch('/api/checkin/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      setResult(data)
      setTimeout(() => {
        setResult(null)
        lastScanRef.current = ''
      }, 4000)
    } catch {
      setResult({ status: 'invalid' })
    } finally {
      setLoading(false)
    }
  }, [loading])

  function scanFrame() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }
    const ctx = canvas.getContext('2d')!
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    if (code?.data) {
      validateToken(code.data)
    }
    rafRef.current = requestAnimationFrame(scanFrame)
  }

  const resultBg = result?.status === 'success'
    ? 'bg-accent/15 border-accent/30'
    : result
    ? 'bg-danger/15 border-danger/30'
    : 'bg-bg-elev border-border'

  return (
    <div className="h-screen flex flex-col bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-fg-dim">Eevex</p>
          <h1 className="font-heading font-medium text-sm text-fg">Check-in · Recepcionista</h1>
        </div>
        <div className="flex items-center gap-2">
          {online ? (
            <Wifi className="h-4 w-4 text-accent" />
          ) : (
            <WifiOff className="h-4 w-4 text-warn" />
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setManualMode((m) => !m)}
          >
            <UserSearch className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {!manualMode && (
          <div className="relative w-full max-w-sm aspect-square rounded-xl overflow-hidden bg-black">
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-48 w-48 border-2 border-primary/60 rounded-lg relative">
                <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-primary rounded-tl-md" />
                <div className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-primary rounded-tr-md" />
                <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-primary rounded-bl-md" />
                <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-primary rounded-br-md" />
                {scanning && (
                  <div className="absolute left-0 right-0 h-0.5 bg-primary/70 animate-[scan_2s_ease-in-out_infinite]" />
                )}
              </div>
            </div>
          </div>
        )}

        {manualMode && (
          <div className="w-full max-w-sm space-y-3">
            <p className="text-sm text-fg-muted text-center">Busca manual por nome, CPF ou código</p>
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="Nome, CPF ou código do pedido"
              className="w-full h-10 rounded-md bg-bg-elev border border-border px-3 text-sm text-fg placeholder:text-fg-dim focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <Button
              onClick={() => validateToken(manualQuery)}
              disabled={!manualQuery || loading}
              className="w-full"
            >
              Buscar e validar
            </Button>
          </div>
        )}

        {/* Result card */}
        {result && (
          <div className={`w-full max-w-sm rounded-xl border p-5 ${resultBg} transition-all`}>
            {result.status === 'success' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span className="font-heading font-semibold text-lg text-fg">Check-in OK!</span>
                </div>
                <p className="font-heading font-medium text-fg">{result.participant.name}</p>
                <p className="text-sm text-fg-muted">{result.participant.ticketType}</p>
                <p className="font-mono text-xs text-fg-dim">#{result.participant.orderCode}</p>
              </div>
            )}
            {result.status === 'already_used' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚫</span>
                  <span className="font-heading font-semibold text-lg text-danger">Já utilizado</span>
                </div>
                <p className="text-sm text-fg-muted">Check-in em: {result.checkedInAt}</p>
              </div>
            )}
            {result.status === 'invalid' && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">❌</span>
                <span className="font-heading font-semibold text-lg text-danger">Ingresso inválido</span>
              </div>
            )}
            {result.status === 'cancelled' && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">⛔</span>
                <span className="font-heading font-semibold text-lg text-danger">Ingresso cancelado</span>
              </div>
            )}
          </div>
        )}

        {/* Camera controls */}
        {!manualMode && (
          <Button
            onClick={scanning ? stopCamera : startCamera}
            variant={scanning ? 'secondary' : 'primary'}
            size="lg"
          >
            <ScanLine className="h-5 w-5" />
            {scanning ? 'Parar câmera' : 'Iniciar câmera'}
          </Button>
        )}
      </div>
    </div>
  )
}
