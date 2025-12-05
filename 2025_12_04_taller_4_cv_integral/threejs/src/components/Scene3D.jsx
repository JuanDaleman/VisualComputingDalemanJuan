import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere, Box, Torus } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedSphere({ position, color, isRotating }) {
    const meshRef = useRef()

    useFrame((state, delta) => {
        if (meshRef.current) {
            if (isRotating) {
                meshRef.current.rotation.x += delta * 0.5
                meshRef.current.rotation.y += delta * 0.3
            }

            // Floating animation
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2
        }
    })

    return (
        <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
            <MeshDistortMaterial
                color={new THREE.Color(...color)}
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    )
}

function AnimatedBox({ position, color, isRotating }) {
    const meshRef = useRef()

    useFrame((state, delta) => {
        if (meshRef.current) {
            if (isRotating) {
                meshRef.current.rotation.x += delta * 0.7
                meshRef.current.rotation.z += delta * 0.5
            }

            // Floating animation
            meshRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * 1.5) * 0.15
        }
    })

    return (
        <Box ref={meshRef} args={[1, 1, 1]} position={position}>
            <meshStandardMaterial
                color={new THREE.Color(...color).multiplyScalar(0.8)}
                roughness={0.3}
                metalness={0.7}
                emissive={new THREE.Color(...color)}
                emissiveIntensity={0.2}
            />
        </Box>
    )
}

function AnimatedTorus({ position, color, isRotating }) {
    const meshRef = useRef()

    useFrame((state, delta) => {
        if (meshRef.current) {
            if (isRotating) {
                meshRef.current.rotation.y += delta * 0.6
                meshRef.current.rotation.x += delta * 0.4
            }

            // Floating animation
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.25
        }
    })

    return (
        <Torus ref={meshRef} args={[0.8, 0.3, 16, 100]} position={position}>
            <meshStandardMaterial
                color={new THREE.Color(...color).multiplyScalar(1.2)}
                roughness={0.1}
                metalness={0.9}
                emissive={new THREE.Color(...color)}
                emissiveIntensity={0.3}
            />
        </Torus>
    )
}

function ParticleField() {
    const particlesRef = useRef()
    const particleCount = 1000

    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20

        colors[i * 3] = Math.random()
        colors[i * 3 + 1] = Math.random() * 0.5 + 0.5
        colors[i * 3 + 2] = 1
    }

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
        }
    })

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particleCount}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    )
}

export default function Scene3D({ color, isRotating }) {
    return (
        <group>
            {/* Main objects */}
            <AnimatedSphere position={[0, 0, 0]} color={color} isRotating={isRotating} />
            <AnimatedBox position={[-3, 0, -2]} color={[color[0] * 0.8, color[1], color[2] * 1.2]} isRotating={isRotating} />
            <AnimatedTorus position={[3, 0, -1]} color={[color[0] * 1.2, color[1] * 0.8, color[2]]} isRotating={isRotating} />

            {/* Particle field */}
            <ParticleField />

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial
                    color="#0a0e27"
                    roughness={0.8}
                    metalness={0.2}
                    transparent
                    opacity={0.5}
                />
            </mesh>
        </group>
    )
}
