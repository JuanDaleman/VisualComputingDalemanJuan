// Vertex Shader: Toon Shading
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    // Transformar normal al espacio de la cámara
    vNormal = normalize(normalMatrix * normal);
    
    // Calcular posición en el espacio de vista
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
}
