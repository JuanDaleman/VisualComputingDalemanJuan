// sketch_3d.pde

void setup() {
  size(800, 600, P3D);  // ✅ Primera línea ejecutable del sketch
  rectMode(CENTER);
  noStroke();
}

void draw() {
  background(18);

  // luces
  lights();
  ambientLight(64, 64, 64);
  directionalLight(200, 200, 200, -0.5, -1, -0.5);

  float t = millis() / 1000.0;
  float waveX = sin(t * TWO_PI * 0.6) * 180;
  float waveY = sin(t * TWO_PI * 0.4) * 80;
  float rotation = frameCount * 0.02;
  float s = map(sin(t * TWO_PI * 1.2), -1, 1, 0.6, 1.4);

  pushMatrix();
  translate(width/2, height/2, 0);
  translate(waveX, waveY, sin(t * 1.5) * 80);
  rotateX(rotation * 0.9);
  rotateY(rotation * 1.3);
  scale(s);

  fill(220, 80, 80);
  box(120);
  popMatrix();

  fill(255);
  textAlign(LEFT, TOP);
  text("t = " + nf(t,1,2) + " s", 10, 10);
  text("scale = " + nf(s,1,2), 10, 26);
}
