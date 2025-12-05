import './DetectionOverlay.css'

export default function DetectionOverlay({ detections }) {
    if (!detections || detections.length === 0) {
        return null
    }

    return (
        <div className="detection-overlay">
            <div className="detection-header">
                <h3>🎯 Detections ({detections.length})</h3>
            </div>
            <div className="detection-list">
                {detections.map((detection, idx) => (
                    <div key={idx} className="detection-item glass">
                        <div className="detection-icon">
                            {getIconForClass(detection.class)}
                        </div>
                        <div className="detection-info">
                            <div className="detection-class">{detection.class}</div>
                            <div className="detection-confidence">
                                {(detection.confidence * 100).toFixed(1)}% confidence
                            </div>
                        </div>
                        <div className="confidence-bar">
                            <div
                                className="confidence-fill"
                                style={{ width: `${detection.confidence * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function getIconForClass(className) {
    const icons = {
        person: '🧑',
        car: '🚗',
        dog: '🐕',
        cat: '🐈',
        bicycle: '🚲',
        motorcycle: '🏍️',
        bus: '🚌',
        truck: '🚚',
        bird: '🐦',
        horse: '🐴',
        chair: '🪑',
        laptop: '💻',
        phone: '📱',
        bottle: '🍾',
        cup: '☕',
        book: '📚',
        clock: '🕐',
        default: '📦'
    }

    return icons[className.toLowerCase()] || icons.default
}
