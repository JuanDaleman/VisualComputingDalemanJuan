// Fragment Shader: Color por Tiempo
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    // Crear ondas de color que se mueven con el tiempo
    float wave1 = sin(vUv.x * 10.0 + time * 2.0);
    float wave2 = cos(vUv.y * 10.0 + time * 1.5);
    float wave3 = sin((vUv.x + vUv.y) * 5.0 + time);
    
    // Combinar ondas para crear colores RGB
    vec3 color = vec3(
        (wave1 + 1.0) * 0.5,  // Rojo oscila entre 0 y 1
        (wave2 + 1.0) * 0.5,  // Verde oscila entre 0 y 1
        (wave3 + 1.0) * 0.5   // Azul oscila entre 0 y 1
    );
    
    // Añadir un poco de brillo base
    color += vec3(0.2);
    
    gl_FragColor = vec4(color, 1.0);
}
