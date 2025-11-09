/**
 * Sistema de Recepción OSC para Processing
 * Recibe comandos de voz desde Python vía OSC
 * 
 * Instalación de librería oscP5:
 * 1. Processing > Sketch > Import Library > Add Library...
 * 2. Buscar "oscP5"
 * 3. Instalar "oscP5" por Andreas Schlegel
 */

import oscP5.*;
import netP5.*;

// Configuración OSC
OscP5 oscP5;
NetAddress pythonAddress;
int receivePort = 8000;
int sendPort = 8001;

// Estado visual
color currentColor = color(255);
String currentShape = "circle";
float shapeSize = 100;
float targetSize = 100;
float rotation = 0;
boolean isRotating = false;
boolean isMoving = false;
float moveX = 0, moveY = 0;

// Sistema de partículas
ArrayList<Particle> particles;
boolean showParticles = false;

// Animaciones
float scaleSpeed = 0.05;
float rotationSpeed = 2;
float moveSpeed = 0.02;

// UI
String lastCommand = "Esperando comandos...";
int commandTime = 0;
int commandDisplayDuration = 3000; // ms

void setup() {
  size(800, 600);
  smooth();
  
  // Inicializar OSC
  oscP5 = new OscP5(this, receivePort);
  pythonAddress = new NetAddress("127.0.0.1", sendPort);
  
  // Inicializar partículas
  particles = new ArrayList<Particle>();
  
  println("✓ Processing OSC Receiver iniciado");
  println("Escuchando en puerto: " + receivePort);
  println("Enviando a puerto: " + sendPort);
  println("\nEsperando comandos de voz...\n");
}

void draw() {
  background(30);
  
  // Actualizar animaciones
  updateAnimations();
  
  // Dibujar objeto principal
  pushMatrix();
  translate(width/2 + moveX, height/2 + moveY);
  rotate(radians(rotation));
  
  fill(currentColor);
  stroke(255, 100);
  strokeWeight(2);
  
  drawShape(currentShape, shapeSize);
  popMatrix();
  
  // Dibujar partículas
  if (showParticles) {
    updateParticles();
  }
  
  // Dibujar UI
  drawUI();
}

void updateAnimations() {
  // Rotación
  if (isRotating) {
    rotation += rotationSpeed;
  }
  
  // Escala suave
  if (shapeSize != targetSize) {
    shapeSize = lerp(shapeSize, targetSize, scaleSpeed);
    if (abs(shapeSize - targetSize) < 0.5) {
      shapeSize = targetSize;
      sendOSC("/processing/scale_complete");
    }
  }
  
  // Movimiento
  if (isMoving) {
    float time = millis() * 0.001;
    moveX = sin(time * moveSpeed * 10) * 200;
    moveY = cos(time * moveSpeed * 10) * 150;
  } else {
    moveX = lerp(moveX, 0, 0.1);
    moveY = lerp(moveY, 0, 0.1);
  }
}

void drawShape(String shape, float size) {
  // Normalizar shape para manejar tildes
  String normalized = normalizeString(shape);
  
  switch(normalized) {
    case "circle":
    case "circulo":
      ellipse(0, 0, size, size);
      break;
      
    case "square":
    case "cuadrado":
      rectMode(CENTER);
      rect(0, 0, size, size);
      break;
      
    case "triangle":
    case "triangulo":
      float h = size * sqrt(3) / 2;
      triangle(0, -h/2, -size/2, h/2, size/2, h/2);
      break;
      
    case "estrella":
    case "star":
      drawStar(0, 0, size/3, size/2, 5);
      break;
      
    case "hexagono":
    case "hexagon":
      drawPolygon(0, 0, size/2, 6);
      break;
      
    default:
      ellipse(0, 0, size, size);
  }
}

// Normalizar strings removiendo tildes
String normalizeString(String input) {
  String normalized = input.toLowerCase();
  
  // Reemplazar caracteres con tildes
  normalized = normalized.replace("á", "a");
  normalized = normalized.replace("é", "e");
  normalized = normalized.replace("í", "i");
  normalized = normalized.replace("ó", "o");
  normalized = normalized.replace("ú", "u");
  normalized = normalized.replace("ñ", "n");
  
  return normalized;
}

// Dibujar estrella
void drawStar(float x, float y, float radius1, float radius2, int npoints) {
  float angle = TWO_PI / npoints;
  float halfAngle = angle / 2.0;
  
  beginShape();
  for (float a = -PI/2; a < TWO_PI - PI/2; a += angle) {
    float sx = x + cos(a) * radius2;
    float sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// Dibujar polígono regular
void drawPolygon(float x, float y, float radius, int npoints) {
  float angle = TWO_PI / npoints;
  beginShape();
  for (float a = -PI/2; a < TWO_PI - PI/2; a += angle) {
    float sx = x + cos(a) * radius;
    float sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

void updateParticles() {
  // Crear nuevas partículas
  for (int i = 0; i < 2; i++) {
    particles.add(new Particle(width/2, height/2));
  }
  
  // Actualizar y dibujar partículas
  for (int i = particles.size() - 1; i >= 0; i--) {
    Particle p = particles.get(i);
    p.update();
    p.display();
    
    if (p.isDead()) {
      particles.remove(i);
    }
  }
}

void drawUI() {
  // Panel de información
  fill(0, 150);
  noStroke();
  rect(0, 0, width, 80);
  
  // Título
  fill(255);
  textAlign(LEFT, TOP);
  textSize(16);
  text("🎤 Control por Voz - Processing", 10, 10);
  
  // Estado
  textSize(12);
  fill(200);
  text("Color: " + colorToString(currentColor), 10, 35);
  text("Forma: " + currentShape, 10, 50);
  text("Tamaño: " + int(shapeSize), 150, 50);
  text("Rotación: " + (isRotating ? "ON" : "OFF"), 250, 50);
  text("Partículas: " + (showParticles ? "ON" : "OFF"), 350, 50);
  
  // Último comando
  if (millis() - commandTime < commandDisplayDuration) {
    fill(100, 255, 100);
    textAlign(CENTER, TOP);
    textSize(14);
    text("► " + lastCommand, width/2, 60);
  }
  
  // Indicador de conexión
  fill(0, 255, 0);
  ellipse(width - 20, 20, 10, 10);
  fill(200);
  textAlign(RIGHT, TOP);
  textSize(10);
  text("OSC:" + receivePort, width - 35, 15);
}

String colorToString(color c) {
  if (c == color(255, 0, 0)) return "Rojo";
  if (c == color(0, 0, 255)) return "Azul";
  if (c == color(0, 255, 0)) return "Verde";
  if (c == color(255, 255, 0)) return "Amarillo";
  if (c == color(255, 128, 0)) return "Naranja";
  return "Personalizado";
}

// ========================================================================
// HANDLERS DE MENSAJES OSC
// ========================================================================

void oscEvent(OscMessage msg) {
  String addr = msg.addrPattern();
  
  // Comandos visuales
  if (addr.equals("/visual/color")) {
    handleColorCommand(msg);
  }
  else if (addr.equals("/visual/shape")) {
    handleShapeCommand(msg);
  }
  else if (addr.equals("/visual/rotate")) {
    handleRotateCommand(msg);
  }
  else if (addr.equals("/visual/scale")) {
    handleScaleCommand(msg);
  }
  else if (addr.equals("/visual/move")) {
    handleMoveCommand(msg);
  }
  
  // Comandos de escena
  else if (addr.equals("/scene/clear")) {
    handleClearScene(msg);
  }
  else if (addr.equals("/scene/save")) {
    handleSaveScene(msg);
  }
  else if (addr.equals("/scene/load")) {
    handleLoadScene(msg);
  }
  
  // Comandos de efectos
  else if (addr.equals("/effects/particles")) {
    handleParticlesCommand(msg);
  }
  else if (addr.equals("/effects/explosion")) {
    handleExplosionCommand(msg);
  }
  
  // Comandos genéricos
  else if (addr.equals("/voice/text")) {
    handleVoiceText(msg);
  }
  else if (addr.equals("/custom/test")) {
    handleCustomCommand(msg);
  }
  
  else {
    println("Comando OSC no reconocido: " + addr);
  }
}

void handleColorCommand(OscMessage msg) {
  float r = msg.get(0).floatValue();
  float g = msg.get(1).floatValue();
  float b = msg.get(2).floatValue();
  
  currentColor = color(r * 255, g * 255, b * 255);
  lastCommand = "Color cambiado";
  commandTime = millis();
  
  println("Color cambiado a RGB(" + (r*255) + ", " + (g*255) + ", " + (b*255) + ")");
  sendOSC("/processing/color_changed", r, g, b);
}

void handleShapeCommand(OscMessage msg) {
  currentShape = msg.get(0).stringValue();
  lastCommand = "Forma: " + currentShape;
  commandTime = millis();
  
  println("Forma cambiada a: " + currentShape);
  sendOSC("/processing/shape_changed", currentShape);
}

void handleRotateCommand(OscMessage msg) {
  // Processing oscP5 no tiene getBool(), usar getInt()
  int rotateValue = msg.get(0).intValue();
  isRotating = (rotateValue == 1);
  
  lastCommand = "Rotación: " + (isRotating ? "ON" : "OFF");
  commandTime = millis();
  
  println("Rotación: " + (isRotating ? "activada" : "desactivada"));
  sendOSC("/processing/rotation", isRotating ? 1 : 0);
}

void handleScaleCommand(OscMessage msg) {
  float scale = msg.get(0).floatValue();
  targetSize = 100 * scale;
  
  lastCommand = "Escalando a " + scale + "x";
  commandTime = millis();
  
  println("Escalando a: " + scale + "x");
  sendOSC("/processing/scaling", scale);
}

void handleMoveCommand(OscMessage msg) {
  int moveValue = msg.get(0).intValue();
  isMoving = (moveValue == 1);
  
  lastCommand = "Movimiento: " + (isMoving ? "ON" : "OFF");
  commandTime = millis();
  
  println("Movimiento: " + (isMoving ? "activado" : "desactivado"));
  sendOSC("/processing/movement", isMoving ? 1 : 0);
}

void handleClearScene(OscMessage msg) {
  // Resetear todo
  currentColor = color(255);
  currentShape = "circle";
  shapeSize = 100;
  targetSize = 100;
  rotation = 0;
  isRotating = false;
  isMoving = false;
  moveX = 0;
  moveY = 0;
  showParticles = false;
  particles.clear();
  
  lastCommand = "Escena limpiada";
  commandTime = millis();
  
  println("Escena limpiada");
  sendOSC("/processing/scene_cleared");
}

void handleSaveScene(OscMessage msg) {
  // Guardar screenshot
  String filename = "scene_" + year() + month() + day() + "_" + 
                    hour() + minute() + second() + ".png";
  save(filename);
  
  lastCommand = "Escena guardada: " + filename;
  commandTime = millis();
  
  println("Escena guardada: " + filename);
  sendOSC("/processing/scene_saved");
}

void handleLoadScene(OscMessage msg) {
  lastCommand = "Cargando escena...";
  commandTime = millis();
  
  println("Cargando escena...");
  sendOSC("/processing/scene_loaded");
}

void handleParticlesCommand(OscMessage msg) {
  int enableValue = msg.get(0).intValue();
  showParticles = (enableValue == 1);
  
  if (!showParticles) {
    particles.clear();
  }
  
  lastCommand = "Partículas: " + (showParticles ? "ON" : "OFF");
  commandTime = millis();
  
  println("Partículas: " + (showParticles ? "activadas" : "desactivadas"));
  sendOSC("/processing/particles", showParticles ? 1 : 0);
}

void handleExplosionCommand(OscMessage msg) {
  lastCommand = "¡EXPLOSIÓN!";
  commandTime = millis();
  
  println("¡Explosión!");
  
  // Crear explosión de partículas
  for (int i = 0; i < 100; i++) {
    particles.add(new Particle(width/2, height/2, true));
  }
  
  // Animación de escala rápida
  targetSize = shapeSize * 3;
  
  sendOSC("/processing/explosion_triggered");
}

void handleVoiceText(OscMessage msg) {
  String text = msg.get(0).stringValue();
  
  lastCommand = "Texto: " + text;
  commandTime = millis();
  
  println("Texto recibido: '" + text + "'");
}

void handleCustomCommand(OscMessage msg) {
  String text = msg.get(0).stringValue();
  
  lastCommand = "Comando personalizado: " + text;
  commandTime = millis();
  
  println("Comando personalizado: '" + text + "'");
  sendOSC("/processing/custom_received", text);
}

// ========================================================================
// ENVÍO DE MENSAJES OSC
// ========================================================================

void sendOSC(String address) {
  OscMessage msg = new OscMessage(address);
  oscP5.send(msg, pythonAddress);
}

void sendOSC(String address, int value) {
  OscMessage msg = new OscMessage(address);
  msg.add(value);
  oscP5.send(msg, pythonAddress);
}

void sendOSC(String address, float value) {
  OscMessage msg = new OscMessage(address);
  msg.add(value);
  oscP5.send(msg, pythonAddress);
}

void sendOSC(String address, String value) {
  OscMessage msg = new OscMessage(address);
  msg.add(value);
  oscP5.send(msg, pythonAddress);
}

void sendOSC(String address, float v1, float v2, float v3) {
  OscMessage msg = new OscMessage(address);
  msg.add(v1);
  msg.add(v2);
  msg.add(v3);
  oscP5.send(msg, pythonAddress);
}

// ========================================================================
// SISTEMA DE PARTÍCULAS
// ========================================================================

class Particle {
  PVector pos, vel;
  float lifespan;
  float size;
  color col;
  boolean isExplosion;
  
  Particle(float x, float y) {
    this(x, y, false);
  }
  
  Particle(float x, float y, boolean explosion) {
    pos = new PVector(x, y);
    isExplosion = explosion;
    
    if (explosion) {
      // Explosión: velocidad alta en todas direcciones
      float angle = random(TWO_PI);
      float speed = random(5, 15);
      vel = PVector.fromAngle(angle).mult(speed);
      lifespan = 255;
      size = random(5, 15);
      col = color(255, random(100, 255), 0);
    } else {
      // Partículas normales: suben lentamente
      vel = new PVector(random(-1, 1), random(-3, -1));
      lifespan = 255;
      size = random(3, 8);
      col = currentColor;
    }
  }
  
  void update() {
    pos.add(vel);
    
    if (isExplosion) {
      vel.mult(0.95); // Fricción
      lifespan -= 5;
    } else {
      lifespan -= 2;
    }
  }
  
  void display() {
    noStroke();
    fill(red(col), green(col), blue(col), lifespan);
    ellipse(pos.x, pos.y, size, size);
  }
  
  boolean isDead() {
    return lifespan <= 0;
  }
}

// ========================================================================
// CONTROLES DE TECLADO PARA PRUEBAS
// ========================================================================

void keyPressed() {
  // Comandos de prueba sin voz
  
  if (key == 'r') {
    currentColor = color(255, 0, 0);
    println("TEST: Rojo");
  }
  else if (key == 'g') {
    currentColor = color(0, 255, 0);
    println("TEST: Verde");
  }
  else if (key == 'b') {
    currentColor = color(0, 0, 255);
    println("TEST: Azul");
  }
  else if (key == '1') {
    currentShape = "circle";
    println("TEST: Círculo");
  }
  else if (key == '2') {
    currentShape = "square";
    println("TEST: Cuadrado");
  }
  else if (key == '3') {
    currentShape = "triangle";
    println("TEST: Triángulo");
  }
  else if (key == 'R') {
    isRotating = !isRotating;
    println("TEST: Rotación " + (isRotating ? "ON" : "OFF"));
  }
  else if (key == 'M') {
    isMoving = !isMoving;
    println("TEST: Movimiento " + (isMoving ? "ON" : "OFF"));
  }
  else if (key == 'p') {
    showParticles = !showParticles;
    println("TEST: Partículas " + (showParticles ? "ON" : "OFF"));
  }
  else if (key == 'e') {
    for (int i = 0; i < 100; i++) {
      particles.add(new Particle(width/2, height/2, true));
    }
    println("TEST: Explosión");
  }
  else if (key == 'c') {
    handleClearScene(null);
  }
  else if (key == '+') {
    targetSize += 50;
    println("TEST: Tamaño + 50");
  }
  else if (key == '-') {
    targetSize = max(50, targetSize - 50);
    println("TEST: Tamaño - 50");
  }
  else if (key == 's') {
    handleSaveScene(null);
  }
  else if (key == 'h') {
    printHelp();
  }
}

void printHelp() {
  println("\n=== CONTROLES DE TECLADO ===");
  println("r/g/b    : Cambiar color (Rojo/Verde/Azul)");
  println("1/2/3    : Cambiar forma (Círculo/Cuadrado/Triángulo)");
  println("R        : Toggle rotación");
  println("M        : Toggle movimiento");
  println("p        : Toggle partículas");
  println("e        : Explosión");
  println("+/-      : Aumentar/reducir tamaño");
  println("c        : Limpiar escena");
  println("s        : Guardar screenshot");
  println("h        : Mostrar esta ayuda");
  println("============================\n");
}
