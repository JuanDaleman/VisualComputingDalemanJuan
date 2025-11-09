// Fragment Shader: Color por Posición
// Recibe la posición del vertex shader
varying vec3 vPosition;
varying vec2 vUv;

void main() {
    // Normalizar la posición Y entre 0 y 1
    // Asumiendo que el objeto está entre -5 y 5 en Y
    float normalizedY = (vPosition.y + 5.0) / 10.0;
    
    // Definir dos colores para interpolar
    vec3 bottomColor = vec3(1.0, 0.2, 0.4);  // Rosa intenso
    vec3 topColor = vec3(0.2, 0.4, 1.0);     // Azul cielo
    
    // Mezclar colores basándose en la altura
    vec3 finalColor = mix(bottomColor, topColor, normalizedY);
    
    // Añadir un toque de variación horizontal
    float horizontalVariation = sin(vPosition.x * 2.0) * 0.1;
    finalColor += vec3(horizontalVariation);
    
    // Asignar color final con alpha = 1.0 (opaco)
    gl_FragColor = vec4(finalColor, 1.0);
}
