import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei'
import { Suspense, useState, useEffect } from 'react'
import Scene3D from './components/Scene3D'
import Dashboard from './components/Dashboard'
import DetectionOverlay from './components/DetectionOverlay'
import useWebSocket from './hooks/useWebSocket'
import './App.css'

function App() {
    const [detections, setDetections] = useState([])
    const [metrics, setMetrics] = useState({ fps: 0, latency: 0, detections: 0 })
    const [sceneColor, setSceneColor] = useState([0.4, 0.5, 0.9])
    const [isRotating, setIsRotating] = useState(true)

    const [lastCommand, setLastCommand] = useState("None")

    // WebSocket connection
    const { sendMessage, lastMessage, connectionStatus } = useWebSocket('ws://localhost:8000/ws')

    useEffect(() => {
        if (lastMessage) {
            console.log("📩 WebSocket Message:", lastMessage.data)
            try {
                const data = JSON.parse(lastMessage.data)

                switch (data.type) {
                    case 'detection':
                        setDetections(data.detections || [])
                        break
                    case 'metrics':
                        setMetrics(data.data || metrics)
                        break
                    case 'command_response':
                        console.log("⚡ Command Response:", data.action)
                        setLastCommand(data.action?.action || "Unknown")
                        handleCommand(data.action)
                        break
                    default:
                        break
                }
            } catch (e) {
                console.error("Error parsing message:", e)
            }
        }
    }, [lastMessage])

    const handleCommand = (action) => {
        if (!action) return

        switch (action.action) {
            case 'color_change':
                setSceneColor(action.value)
                break
            case 'rotate':
                setIsRotating(prev => !prev)
                break
            case 'stop':
                setIsRotating(false)
                break
            case 'reset':
                setSceneColor([0.4, 0.5, 0.9])
                setIsRotating(true)
                break
            default:
                break
        }
    }

    const handleVoiceCommand = (command) => {
        sendMessage({
            type: 'command',
            command: command
        })
    }

    return (
        <div className="app-container">
            {/* 3D Canvas */}
            <Canvas className="canvas-3d">
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                    <OrbitControls enableDamping dampingFactor={0.05} />

                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <spotLight position={[-10, 10, 5]} angle={0.3} penumbra={1} intensity={0.5} />

                    {/* Background */}
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                    {/* Main Scene */}
                    <Scene3D color={sceneColor} isRotating={isRotating} />
                </Suspense>
            </Canvas>

            {/* UI Overlays */}
            <Dashboard
                metrics={metrics}
                connectionStatus={connectionStatus}
                onVoiceCommand={handleVoiceCommand}
                lastCommand={lastCommand}
            />

            <DetectionOverlay detections={detections} />

            {/* Header */}
            <header className="app-header">
                <h1 className="gradient-text">Visual Computing System</h1>
                <div className="status-indicator">
                    <div className={`status-dot ${connectionStatus === 'Open' ? 'connected' : 'disconnected'}`} />
                    <span>{connectionStatus === 'Open' ? 'Connected' : 'Disconnected'}</span>
                </div>
            </header>

            {/* Controls Info */}
            <div className="controls-info glass">
                <h3>Controls</h3>
                <ul>
                    <li><strong>Mouse:</strong> Rotate view</li>
                    <li><strong>Scroll:</strong> Zoom in/out</li>
                    <li><strong>Voice:</strong> "change color", "rotate", "stop", "reset"</li>
                    <li><strong>Gestures:</strong> ✌️ Peace, ✊ Fist, 👍 Thumbs up</li>
                </ul>
            </div>
        </div>
    )
}

export default App
