import { Link, Outlet } from 'react-router-dom'
import styles from './Layout.module.css'

export function Layout() {
  return (
    <>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoDot} />
          DWLOAD
        </Link>
        <ul className={styles.navLinks}>
          <li><Link to="/history">HISTORY</Link></li>
          <li><Link to="/tweaks">TWEAKS</Link></li>
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
