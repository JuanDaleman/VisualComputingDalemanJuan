// Fragment Shader: Distorsión UV
uniform float time;
uniform float distortionStrength;
uniform float waveFrequency;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    // Distorsión UV con ondas sinusoidales
    vec2 distortedUv = vUv;
    
    // Ondas horizontales y verticales
    distortedUv.x += sin(vUv.y * waveFrequency + time * 2.0) * distortionStrength;
    distortedUv.y += cos(vUv.x * waveFrequency + time * 1.5) * distortionStrength;
    
    // Ondas circulares desde el centro
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);
    float radialWave = sin(dist * 10.0 - time * 3.0) * distortionStrength * 0.5;
    distortedUv += normalize(vUv - center) * radialWave;
    
    // Crear patrón de colores basado en UV distorsionadas
    vec3 color1 = vec3(0.2, 0.6, 1.0); // Azul
    vec3 color2 = vec3(1.0, 0.3, 0.5); // Rosa
    vec3 color3 = vec3(0.3, 1.0, 0.4); // Verde
    
    // Mix de colores usando UV distorsionadas
    float mixFactor1 = sin(distortedUv.x * 6.28318) * 0.5 + 0.5;
    float mixFactor2 = cos(distortedUv.y * 6.28318) * 0.5 + 0.5;
    
    vec3 finalColor = mix(color1, color2, mixFactor1);
    finalColor = mix(finalColor, color3, mixFactor2);
    
    // Agregar variación temporal
    finalColor += vec3(sin(time * 0.5) * 0.1);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
