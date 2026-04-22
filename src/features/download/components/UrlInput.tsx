import styles from './UrlInput.module.css'

const PLATFORMS = [
  { re: /youtube\.com|youtu\.be/, icon: '▶' },
  { re: /spotify\.com/, icon: '♫' },
  { re: /twitter\.com|x\.com/, icon: '𝕏' },
  { re: /instagram\.com/, icon: '◈' },
  { re: /tiktok\.com/, icon: '◉' },
  { re: /soundcloud\.com/, icon: '☁' },
  { re: /vimeo\.com/, icon: '◇' },
  { re: /twitch\.tv/, icon: '◈' },
] as const

function detectPlatformIcon(url: string): string | null {
  return PLATFORMS.find((p) => p.re.test(url))?.icon ?? null
}

interface Props {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function UrlInput({ value, onChange, error }: Props) {
  const icon = detectPlatformIcon(value)

  return (
    <div className={styles.wrap}>
      {icon && (
        <span className={`${styles.platformIcon} ${styles.visible}`}>
          {icon}
        </span>
      )}
      <input
        type="url"
        className={`${styles.input} ${icon ? styles.hasIcon : ''}`}
        placeholder="https://youtube.com/watch?v= ..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="URL do vídeo ou áudio"
        aria-invalid={!!error}
        style={error ? { borderColor: 'rgba(248,113,113,0.6)' } : undefined}
      />
    </div>
  )
}
