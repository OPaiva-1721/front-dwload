import { Component, type ReactNode } from 'react'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className={styles.root}>
        <div className={styles.card}>
          <span className={styles.icon}>⚠</span>
          <h2 className={styles.title}>Signal Lost</h2>
          <p className={styles.message}>{error.message}</p>
          <button className={styles.btn} onClick={this.reset}>
            ↺ RETRY
          </button>
        </div>
      </div>
    )
  }
}
