// Fragment Shader: Gradiente Animado
uniform float time;
uniform vec3 color1;
uniform vec3 color2;
uniform float gradientSpeed;
varying vec2 vUv;

void main() {
    // Calcular el factor de mezcla basado en UV y tiempo
    float mixFactor = vUv.x + sin(time * gradientSpeed + vUv.y * 3.14159) * 0.3;
    
    // Asegurar que mixFactor está entre 0 y 1
    mixFactor = clamp(mixFactor, 0.0, 1.0);
    
    // Interpolar entre los dos colores
    vec3 finalColor = mix(color1, color2, mixFactor);
    
    // Añadir un toque de variación vertical
    float verticalWave = sin(vUv.y * 5.0 + time * 0.5) * 0.1;
    finalColor += vec3(verticalWave);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
