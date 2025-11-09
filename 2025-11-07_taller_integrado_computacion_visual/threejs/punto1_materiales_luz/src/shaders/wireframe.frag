// Fragment Shader: Wireframe
uniform vec3 wireframeColor;
uniform vec3 fillColor;
uniform float wireframeThickness;
uniform float time;
varying vec3 vBarycentric;
varying vec3 vPosition;

void main() {
    // Calcular la distancia al borde más cercano usando coordenadas baricéntricas
    vec3 barycentric = vBarycentric;
    
    // Suavizado del borde
    vec3 deltas = fwidth(barycentric);
    vec3 smoothing = deltas * wireframeThickness;
    vec3 thickness = smoothing * 1.5;
    
    // Distancia a cada borde
    vec3 edgeFactors = smoothstep(vec3(0.0), thickness, barycentric);
    
    // El borde más cercano determina si estamos en wireframe
    float edgeFactor = min(min(edgeFactors.x, edgeFactors.y), edgeFactors.z);
    
    // Mezclar entre color de wireframe y color de relleno
    vec3 finalColor = mix(wireframeColor, fillColor, edgeFactor);
    
    // Opcional: Animar el color del wireframe
    float pulse = sin(time * 2.0) * 0.3 + 0.7;
    finalColor = mix(finalColor, wireframeColor * pulse, 1.0 - edgeFactor);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
