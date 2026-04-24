import { useEffect } from 'react'
import { useTweaksStore } from './store'
import styles from './TweaksPanel.module.css'

export function TweaksPanel() {
  const { accent, density, speed, showPanel, toggle, set } = useTweaksStore()

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-purple', accent)
  }, [accent])

  if (!showPanel) return null

  return (
    <>
      <div className={styles.backdrop} onClick={toggle} />
      <aside className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>TWEAKS</span>
          <button className={styles.closeBtn} onClick={toggle}>✕</button>
        </div>

        <div className={styles.body}>
          <label className={styles.field}>
            <span className={styles.label}>ACCENT COLOR</span>
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.colorInput}
                value={accent}
                onChange={(e) => set({ accent: e.target.value })}
              />
              <span className={styles.colorHex}>{accent}</span>
            </div>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              STAR DENSITY <span className={styles.value}>{density}</span>
            </span>
            <input
              type="range"
              className={styles.slider}
              min={50}
              max={500}
              step={10}
              value={density}
              onChange={(e) => set({ density: Number(e.target.value) })}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              SPEED <span className={styles.value}>{speed.toFixed(1)}×</span>
            </span>
            <input
              type="range"
              className={styles.slider}
              min={0.2}
              max={3}
              step={0.1}
              value={speed}
              onChange={(e) => set({ speed: Number(e.target.value) })}
            />
          </label>
        </div>

        <button
          className={styles.resetBtn}
          onClick={() => set({ accent: '#a78bfa', density: 230, speed: 1 })}
        >
          RESET DEFAULTS
        </button>
      </aside>
    </>
  )
}
