// Vertex Shader: Color por Posición
// Variables que se pasan al fragment shader
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
    // Pasar posición del vértice al fragment shader
    vPosition = position;
    
    // Pasar coordenadas UV
    vUv = uv;
    
    // Pasar normal transformada
    vNormal = normalize(normalMatrix * normal);
    
    // Calcular posición final del vértice en pantalla
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
