import { NavLink, Link, Outlet } from 'react-router-dom'
import { useTweaksStore } from '@/features/tweaks/store'
import styles from './Layout.module.css'

export function Layout() {
  const toggleTweaks = useTweaksStore((s) => s.toggle)

  return (
    <>
      <nav className={styles.nav} aria-label="Main">
        <Link to="/" className={styles.logo}>
          <span className={styles.logoDot} aria-hidden />
          DWLOAD
        </Link>
        <ul className={styles.navLinks}>
          <li><NavLink to="/history">History</NavLink></li>
          {/* Design playground (accent, star density, speed): a dev tool, not a product feature */}
          {import.meta.env.DEV && (
            <li><button type="button" className={styles.tweaksBtn} onClick={toggleTweaks}>Tweaks</button></li>
          )}
        </ul>
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footerTag}>
        <span className={styles.footerDot} aria-hidden />
        Files are deleted automatically after 1 hour
        <span className={styles.footerDot} aria-hidden />
      </footer>
    </>
  )
}
