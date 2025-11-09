// Fragment Shader: Texturizado Procedural
uniform float time;
uniform float scale;
uniform int patternType; // 0: checkerboard, 1: dots, 2: noise-like, 3: stripes
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

// Función de ruido pseudo-aleatorio simple
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Patrón de tablero de ajedrez
vec3 checkerboard(vec2 uv, float scale) {
    vec2 scaledUv = uv * scale;
    float checker = mod(floor(scaledUv.x) + floor(scaledUv.y), 2.0);
    return vec3(checker);
}

// Patrón de puntos
vec3 dots(vec2 uv, float scale) {
    vec2 scaledUv = uv * scale;
    vec2 gridUv = fract(scaledUv);
    vec2 center = vec2(0.5);
    float dist = distance(gridUv, center);
    float dot = smoothstep(0.4, 0.3, dist);
    return vec3(dot);
}

// Patrón de ruido (pseudo-noise usando random)
vec3 noise(vec2 uv, float scale, float time) {
    vec2 scaledUv = uv * scale;
    vec2 i = floor(scaledUv);
    vec2 f = fract(scaledUv);
    
    // Smooth interpolation
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    // Sample four corners with time variation
    float a = random(i + vec2(0.0, 0.0) + time * 0.1);
    float b = random(i + vec2(1.0, 0.0) + time * 0.1);
    float c = random(i + vec2(0.0, 1.0) + time * 0.1);
    float d = random(i + vec2(1.0, 1.0) + time * 0.1);
    
    // Bilinear interpolation
    float noiseVal = mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    return vec3(noiseVal);
}

// Patrón de rayas
vec3 stripes(vec2 uv, float scale, float time) {
    float stripe = sin((uv.x + uv.y) * scale + time * 2.0) * 0.5 + 0.5;
    // Agregar rayas cruzadas
    float stripe2 = sin((uv.x - uv.y) * scale * 0.7 - time * 1.5) * 0.5 + 0.5;
    float combined = stripe * 0.7 + stripe2 * 0.3;
    return vec3(combined);
}

void main() {
    vec3 pattern;
    
    // Seleccionar patrón según uniform
    if (patternType == 0) {
        pattern = checkerboard(vUv, scale);
    } else if (patternType == 1) {
        pattern = dots(vUv, scale);
    } else if (patternType == 2) {
        pattern = noise(vUv, scale, time);
    } else {
        pattern = stripes(vUv, scale, time);
    }
    
    // Colorear el patrón
    vec3 color1 = vec3(0.1, 0.2, 0.5); // Azul oscuro
    vec3 color2 = vec3(0.9, 0.7, 0.3); // Naranja claro
    vec3 finalColor = mix(color1, color2, pattern);
    
    // Agregar iluminación simple basada en la normal
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.3);
    finalColor *= diff;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
