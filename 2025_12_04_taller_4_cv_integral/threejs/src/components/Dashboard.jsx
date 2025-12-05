import { useState } from 'react'
import './Dashboard.css'

export default function Dashboard({ metrics, connectionStatus, onVoiceCommand, lastCommand }) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [voiceInput, setVoiceInput] = useState('')

    const handleVoiceSubmit = (e) => {
        e.preventDefault()
        if (voiceInput.trim()) {
            onVoiceCommand(voiceInput.trim())
            setVoiceInput('')
        }
    }

    const quickCommands = [
        { label: 'Change Color', command: 'change color' },
        { label: 'Rotate', command: 'rotate' },
        { label: 'Stop', command: 'stop' },
        { label: 'Reset', command: 'reset' }
    ]

    return (
        <div className={`dashboard glass ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="dashboard-header" onClick={() => setIsExpanded(!isExpanded)}>
                <h2>📊 Dashboard</h2>
                <button className="toggle-btn">{isExpanded ? '−' : '+'}</button>
            </div>

            {isExpanded && (
                <div className="dashboard-content">
                    {/* Metrics */}
                    <div className="metrics-grid">
                        <div className="metric-card glass">
                            <div className="metric-icon">⚡</div>
                            <div className="metric-info">
                                <div className="metric-label">FPS</div>
                                <div className="metric-value">{metrics.fps || 0}</div>
                            </div>
                        </div>

                        <div className="metric-card glass">
                            <div className="metric-icon">🎯</div>
                            <div className="metric-info">
                                <div className="metric-label">Detections</div>
                                <div className="metric-value">{metrics.detections || 0}</div>
                            </div>
                        </div>

                        <div className="metric-card glass">
                            <div className="metric-icon">⏱️</div>
                            <div className="metric-info">
                                <div className="metric-label">Latency</div>
                                <div className="metric-value">{metrics.latency || 0}ms</div>
                            </div>
                        </div>

                        <div className="metric-card glass">
                            <div className="metric-icon">🔗</div>
                            <div className="metric-info">
                                <div className="metric-label">Status</div>
                                <div className="metric-value status">
                                    {connectionStatus === 'Open' ? '✓' : '✗'}
                                </div>
                            </div>
                        </div>

                        <div className="metric-card glass">
                            <div className="metric-icon">💬</div>
                            <div className="metric-info">
                                <div className="metric-label">Last Cmd</div>
                                <div className="metric-value" style={{fontSize: '0.8em'}}>{lastCommand}</div>
                            </div>
                        </div>
                    </div>

                    {/* Voice Commands */}
                    <div className="voice-section">
                        <h3>🎤 Voice Commands</h3>
                        <form onSubmit={handleVoiceSubmit} className="voice-input-form">
                            <input
                                type="text"
                                value={voiceInput}
                                onChange={(e) => setVoiceInput(e.target.value)}
                                placeholder="Type a command..."
                                className="voice-input glass"
                            />
                            <button type="submit" className="send-btn">Send</button>
                        </form>

                        <div className="quick-commands">
                            {quickCommands.map((cmd, idx) => (
                                <button
                                    key={idx}
                                    className="quick-cmd-btn glass"
                                    onClick={() => onVoiceCommand(cmd.command)}
                                >
                                    {cmd.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="system-info">
                        <h3>ℹ️ System Info</h3>
                        <div className="info-item">
                            <span className="info-label">Backend:</span>
                            <span className="info-value">FastAPI + WebSocket</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Detection:</span>
                            <span className="info-value">YOLOv8</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Gestures:</span>
                            <span className="info-value">MediaPipe</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">3D Engine:</span>
                            <span className="info-value">Three.js</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
