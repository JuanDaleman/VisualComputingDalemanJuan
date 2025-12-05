import { useEffect, useRef, useState } from 'react'

export default function useWebSocket(url) {
    const [lastMessage, setLastMessage] = useState(null)
    const [connectionStatus, setConnectionStatus] = useState('Connecting')
    const ws = useRef(null)
    const reconnectTimeout = useRef(null)

    useEffect(() => {
        connect()

        return () => {
            if (ws.current) {
                ws.current.close()
            }
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current)
            }
        }
    }, [url])

    const connect = () => {
        try {
            ws.current = new WebSocket(url)

            ws.current.onopen = () => {
                console.log('WebSocket connected')
                setConnectionStatus('Open')
            }

            ws.current.onmessage = (event) => {
                setLastMessage(event)
            }

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error)
                setConnectionStatus('Error')
            }

            ws.current.onclose = () => {
                console.log('WebSocket disconnected')
                setConnectionStatus('Closed')

                // Attempt to reconnect after 3 seconds
                reconnectTimeout.current = setTimeout(() => {
                    console.log('Attempting to reconnect...')
                    connect()
                }, 3000)
            }
        } catch (error) {
            console.error('Failed to create WebSocket:', error)
            setConnectionStatus('Error')
        }
    }

    const sendMessage = (message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message))
        } else {
            console.warn('WebSocket is not connected')
        }
    }

    return {
        lastMessage,
        connectionStatus,
        sendMessage
    }
}
