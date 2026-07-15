import { Image as ImageIcon } from 'lucide-react'

// Recreates the empty (non-editable) state of <image-slot> (image-slot.js
// .empty / .ring rules): translucent-black frame + dashed ring + centered
// icon + caption — NOT the brief's guessed warm palette, which doesn't
// appear anywhere in image-slot.js or the design source.
export default function ImagePlaceholder({
  label,
  style,
}: {
  label: string
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        textAlign: 'center',
        padding: 12,
        boxSizing: 'border-box',
        background: 'rgba(0,0,0,.04)',
        border: '1.5px dashed rgba(0,0,0,.25)',
        color: 'rgba(0,0,0,.55)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 13,
        lineHeight: 1.3,
        ...style,
      }}
    >
      <ImageIcon size={28} strokeWidth={1.6} style={{ opacity: 0.45 }} />
      <div style={{ maxWidth: '90%', fontWeight: 500, letterSpacing: '.01em' }}>{label}</div>
    </div>
  )
}
