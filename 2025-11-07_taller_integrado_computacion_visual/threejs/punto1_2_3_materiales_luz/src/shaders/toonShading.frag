// Fragment Shader: Toon Shading (Cel Shading)
uniform vec3 lightDirection;
uniform vec3 baseColor;
uniform int shadingLevels;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    // Normalizar la normal
    vec3 normal = normalize(vNormal);
    
    // Dirección de la luz normalizada
    vec3 lightDir = normalize(lightDirection);
    
    // Calcular la intensidad de iluminación (dot product)
    float intensity = dot(normal, lightDir);
    
    // Discretizar la intensidad en niveles (efecto cartoon)
    float levels = float(shadingLevels);
    intensity = floor(intensity * levels) / levels;
    
    // Asegurar un mínimo de iluminación (no completamente negro)
    intensity = max(intensity, 0.15);
    
    // Aplicar intensidad al color base
    vec3 finalColor = baseColor * intensity;
    
    // Detectar bordes para efecto de contorno (opcional)
    vec3 viewDir = normalize(vViewPosition);
    float edge = abs(dot(viewDir, normal));
    
    // Si estamos en el borde, oscurecer
    if (edge < 0.3) {
        finalColor *= 0.3;
    }
    
    gl_FragColor = vec4(finalColor, 1.0);
}
