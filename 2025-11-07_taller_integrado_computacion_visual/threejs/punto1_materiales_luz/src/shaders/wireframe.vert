// Vertex Shader: Wireframe
varying vec3 vBarycentric;
varying vec3 vPosition;

attribute vec3 barycentric;

void main() {
    vBarycentric = barycentric;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
