import { useEffect, useRef } from 'react'
import type { Game } from '../lib/api'

interface EmulatorProps {
  game: Game
}

declare global {
  interface Window {
    EJS_player: string
    EJS_core: string
    EJS_gameUrl: string
    EJS_pathtodata: string
    EJS_biosUrl?: string
  }
}

const CORE_MAP: Record<string, string> = {
  ps1: 'psx',
  n64: 'n64',
  snes: 'snes',
  gba: 'gba',
  gbc: 'gb',
  nes: 'nes',
  genesis: 'segaMD',
  dreamcast: 'dreamcast',
  ps2: 'ps2',
  psp: 'psp',
}

export default function Emulator({ game }: EmulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Set EmulatorJS configuration
    const core = CORE_MAP[game.platform.code] || game.platform.code
    window.EJS_player = '#emulator-container'
    window.EJS_core = core
    window.EJS_gameUrl = `/data/games/${game.platform.code}/${game.rom_path.split('/').pop()}`
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/'

    // Add BIOS if needed (for PS1, PS2, etc.)
    if (game.platform.code === 'ps1') {
      window.EJS_biosUrl = '/bios/scph1001.bin'
    }

    // Load EmulatorJS
    const script = document.createElement('script')
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js'
    script.async = true
    containerRef.current.appendChild(script)

    return () => {
      // Cleanup
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [game])

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
      <div id="emulator-container" ref={containerRef} className="w-full h-full" />
    </div>
  )
}
