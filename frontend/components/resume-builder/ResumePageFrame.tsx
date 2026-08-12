'use client'

import { useEffect, useRef, useState } from 'react'
import { Maximize2, X } from 'lucide-react'

// A4 at 96 CSS px/inch — the standard for accurate on-screen paper simulation
// (this is what Google Docs / Word Online use internally for their page view)
const PAGE_WIDTH_PX = 794
const PAGE_HEIGHT_PX = 1123

// Match these to whatever your actual @react-pdf/renderer templates use.
// Your LaTeX output uses 1cm margins (~37.8px) and looks like ~10-10.5pt body text —
// mirror those exactly here so the HTML preview's line-wrapping matches the real PDF's.
const PAGE_PADDING_PX = 38
const BODY_FONT_SIZE_PX = 13 // ~10pt
const LINE_HEIGHT = 1.35

interface ResumePageFrameProps {
  children: React.ReactNode
  onOverflowChange?: (isOverflowing: boolean) => void
}

export function ResumePageFrame({ children, onOverflowChange }: ResumePageFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [overflowing, setOverflowing] = useState(false)

  // Scale the fixed-size page down to whatever width the panel actually has,
  // instead of the page being a fixed 794px box that breaks a narrow sidebar layout
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const resize = () => {
      const available = container.clientWidth
      setScale(Math.min(1, available / PAGE_WIDTH_PX))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // The actual "will this fit on one page" check — measure real content height
  // against the fixed page height, in un-scaled page pixels
  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const isOver = content.scrollHeight > PAGE_HEIGHT_PX
    setOverflowing(isOver)
    onOverflowChange?.(isOver)
  }, [children, onOverflowChange])

  // Scaling a fixed-height box down leaves empty space below it in normal flow —
  // this collapses that gap so the panel doesn't show a large blank area under a scaled page
  const scaledHeight = PAGE_HEIGHT_PX * scale

  return (
    <div ref={containerRef} className="w-full" style={{ height: scaledHeight }}>
      <div
        style={{
          width: PAGE_WIDTH_PX,
          height: PAGE_HEIGHT_PX,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        className="bg-white shadow-lg rounded-sm relative"
      >
        <div
          ref={contentRef}
          className="absolute inset-0 overflow-hidden"
          style={{
            padding: 0, // Engine takes care of padding internally
            fontSize: BODY_FONT_SIZE_PX,
            lineHeight: LINE_HEIGHT,
          }}
        >
          {children}
        </div>

        {/* Soft fade at the bottom edge when content is clipped, so the cutoff
            reads as "this got cut" rather than looking like a rendering bug */}
        {overflowing && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/10 to-transparent pointer-events-none rounded-b-sm" />
        )}
      </div>

      {overflowing && (
        <p className="mt-2 text-xs text-amber-600 font-medium">
          ⚠ This content overflows one page. Trim a section, shorten descriptions, or pick a denser template.
        </p>
      )}
    </div>
  )
}

/**
 * Wraps ResumePageFrame with an expand button that opens a larger, centered
 * fullscreen view — same component, just given more room to scale up into,
 * since ResumePageFrame already scales itself to fill whatever container it's in.
 */
interface ExpandablePreviewProps {
  children: React.ReactNode
}

export function ExpandablePreview({ children }: ExpandablePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 z-20 p-1.5 rounded-md bg-white/90 border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-white shadow-sm transition-colors"
          aria-label="Expand preview"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <ResumePageFrame>{children}</ResumePageFrame>
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-8"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="h-full flex items-center"
            style={{ width: PAGE_WIDTH_PX }}
            onClick={(e) => e.stopPropagation()}
          >
            <ResumePageFrame>{children}</ResumePageFrame>
          </div>
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X className="h-7 w-7" />
          </button>
        </div>
      )}
    </>
  )
}
