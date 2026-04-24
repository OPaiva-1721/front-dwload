import { Link, Outlet } from 'react-router-dom'
import { useTweaksStore } from '@/features/tweaks/store'
import styles from './Layout.module.css'

export function Layout() {
  const toggleTweaks = useTweaksStore((s) => s.toggle)

  return (
    <>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoDot} />
          DWLOAD
        </Link>
        <ul className={styles.navLinks}>
          <li><Link to="/history">HISTORY</Link></li>
          <li><button className={styles.tweaksBtn} onClick={toggleTweaks}>TWEAKS</button></li>
        </ul>
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footerTag}>
        <span className={styles.footerDot} />
        END-TO-END ENCRYPTED TRANSMISSION
        <span className={styles.footerDot} />
      </footer>
    </>
  )
}
