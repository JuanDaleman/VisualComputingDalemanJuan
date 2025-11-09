// src/ProyeccionesThree.js
import * as THREE from "three";

export function iniciarProyecciones() {
  // Contenedor básico
  const container = document.createElement("div");
  document.body.appendChild(container);
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  document.body.style.fontFamily = "sans-serif";
  container.style.position = "relative";

  // Status / UI overlay
  const ui = document.createElement("div");
  ui.style.position = "absolute";
  ui.style.left = "10px";
  ui.style.top = "10px";
  ui.style.color = "#fff";
  ui.style.background = "rgba(0,0,0,0.5)";
  ui.style.padding = "10px";
  ui.style.borderRadius = "6px";
  ui.style.zIndex = 10;
  ui.innerHTML = `
    <div style="margin-bottom:6px"><b>Proyecciones — Three.js</b></div>
    <div>
      <button id="btnPerspective">Cámara Perspectiva</button>
      <button id="btnOrtho">Cámara Ortográfica</button>
      <label style="margin-left:8px"><input id="chkDepth" type="checkbox" checked> Mostrar profundidad</label>
    </div>
    <div style="margin-top:6px">
      <small>Matrices (view / projection / MVP):</small>
      <pre id="matrices" style="max-height:220px; overflow:auto; background:#111; color:#ddd; padding:6px"></pre>
    </div>
  `;
  container.appendChild(ui);

  // Overlay for 2D projection markers
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.left = "0";
  overlay.style.top = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.pointerEvents = "none";
  container.appendChild(overlay);

  // Renderer / Scene / Default camera (we will swap camera objects)
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111213);

  // Two cameras: perspective + orthographic (we'll switch)
  const aspect = innerWidth / innerHeight;
  const camPerspective = new THREE.PerspectiveCamera(50, aspect, 0.1, 50);
  camPerspective.position.set(4, 3, 6);
  camPerspective.lookAt(0, 0, 0);

  const frustumSize = 6;
  const camOrtho = new THREE.OrthographicCamera(
    ( -frustumSize * aspect) / 2,
    ( frustumSize * aspect) / 2,
    frustumSize / 2,
    -frustumSize / 2,
    0.1,
    50
  );
  camOrtho.position.set(4, 3, 6);
  camOrtho.lookAt(0, 0, 0);

  let camera = camPerspective; // cámara activa

  // Helpers
  const grid = new THREE.GridHelper(12, 12, 0x444444, 0x222222);
  scene.add(grid);

  const axes = new THREE.AxesHelper(3);
  scene.add(axes);

  // Objetos 3D a proyectar: una nube de puntos en 3D + esferas
  const pointsGroup = new THREE.Group();
  scene.add(pointsGroup);

  // Genera puntos en coordenadas 3D (algunos con z positivo, negativo)
  const points = [];
  const N = 24;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = 1.5 + (i % 6) * 0.3;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r * 0.5 + ( (i % 4) - 1.5 ) * 0.5;
    const z = - (1 + (i % 5) * 0.8); // la mayoría delante de la cámara (z negativo en cámara space)
    points.push(new THREE.Vector3(x, y, z));
  }

  // Spheres to show 3D points
  const sphereGeom = new THREE.SphereGeometry(0.07, 12, 10);
  const sphereMat = new THREE.MeshStandardMaterial({ color: 0x88ccff });
  points.forEach((p, idx) => {
    const m = new THREE.Mesh(sphereGeom, sphereMat.clone());
    m.position.copy(p);
    m.userData.index = idx;
    pointsGroup.add(m);
  });

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 0.9);
  light.position.set(5, 10, 7);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040, 0.8));

  // Create DOM markers for projected 2D positions
  const markers = points.map((_, i) => {
    const d = document.createElement("div");
    d.style.position = "absolute";
    d.style.width = "10px";
    d.style.height = "10px";
    d.style.borderRadius = "50%";
    d.style.transform = "translate(-50%, -50%)";
    d.style.pointerEvents = "none";
    d.style.background = "rgba(255,255,255,0.85)";
    d.style.border = "1px solid #000";
    overlay.appendChild(d);
    return d;
  });

  // Utility: map camera-space z to color (depth visualization)
  function depthToColor(zCam, cam) {
    // zCam is camera-space z (negative in front for conventional right-handed camera)
    const near = cam.near !== undefined ? cam.near : 0.1;
    const far = cam.far !== undefined ? cam.far : 50;
    // For perspective camera in Three.js zCam is negative in front; map to positive distance.
    const d = Math.abs(zCam);
    const t = Math.min(1, Math.max(0, (d - near) / (far - near)));
    // gradient: blue -> green -> red
    const r = Math.floor(255 * Math.min(1, t * 1.6));
    const g = Math.floor(255 * Math.max(0, 1 - Math.abs(t - 0.5) * 2));
    const b = Math.floor(255 * (1 - t));
    return `rgb(${r},${g},${b})`;
  }

  // Projection using homogeneous coordinates and matrices (MVP)
  function projectPointWithMVP(point, cam) {
    // point: THREE.Vector3 in world coords
    // build model (identity), view, projection matrices
    const model = new THREE.Matrix4().identity(); // identity, points already in world
    const view = new THREE.Matrix4().copy(cam.matrixWorldInverse); // view = inverse(world)
    const proj = new THREE.Matrix4().copy(cam.projectionMatrix);

    // MVP = proj * view * model
    const mvp = new THREE.Matrix4();
    mvp.multiplyMatrices(proj, view); // mvp = proj * view

    // Homogeneous coordinates
    const v4 = new THREE.Vector4(point.x, point.y, point.z, 1.0);
    v4.applyMatrix4(mvp); // now in clip space
    // perspective divide
    if (Math.abs(v4.w) > 1e-8) {
      v4.x /= v4.w;
      v4.y /= v4.w;
      v4.z /= v4.w;
    }
    // v4.x, v4.y, v4.z are NDC in [-1,1]
    return {
      ndc: new THREE.Vector3(v4.x, v4.y, v4.z),
      mvpMatrix: mvp,
      viewMatrix: view,
      projMatrix: proj,
      clipW: v4.w
    };
  }

  // UI interactions
  document.getElementById("btnPerspective").onclick = () => {
    camera = camPerspective;
  };
  document.getElementById("btnOrtho").onclick = () => {
    camera = camOrtho;
  };

  const chkDepth = document.getElementById("chkDepth");
  chkDepth.checked = true;

  // Resize handling
  window.addEventListener("resize", onWindowResize);
  function onWindowResize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h);
    camPerspective.aspect = w / h;
    camPerspective.updateProjectionMatrix();

    const aspectR = w / h;
    const fs = frustumSize;
    camOrtho.left = (-fs * aspectR) / 2;
    camOrtho.right = (fs * aspectR) / 2;
    camOrtho.top = fs / 2;
    camOrtho.bottom = -fs / 2;
    camOrtho.updateProjectionMatrix();
  }

  // Display matrices (textually)
  const matricesPre = document.getElementById("matrices");

  // Render loop
  function animate() {
    requestAnimationFrame(animate);

    // slowly rotate group for a clearer 3D effect
    pointsGroup.rotation.y += 0.002;

    // Update markers: project each point using MVP and place DOM marker
    points.forEach((p, i) => {
      const worldPos = p.clone();
      // transform by pointsGroup world matrix (they are direct children of pointsGroup)
      const worldMatrix = pointsGroup.matrixWorld;
      worldPos.applyMatrix4(worldMatrix);

      const { ndc, mvpMatrix, viewMatrix, projMatrix, clipW } = projectPointWithMVP(worldPos, camera);

      // Map NDC to screen px:
      const xPx = (ndc.x * 0.5 + 0.5) * innerWidth;
      const yPx = (-ndc.y * 0.5 + 0.5) * innerHeight; // note Y inversion

      // If point is behind camera or outside clip (-1..1), hide marker
      const offscreen = ndc.x < -1 || ndc.x > 1 || ndc.y < -1 || ndc.y > 1 || ndc.z < -1 || ndc.z > 1 || clipW <= 0;

      const marker = markers[i];
      if (offscreen) {
        marker.style.display = "none";
      } else {
        marker.style.display = "block";
        marker.style.left = `${xPx}px`;
        marker.style.top = `${yPx}px`;
      }

      // Depth coloring: compute camera-space z (view * pos).z
      const viewPos = new THREE.Vector4(worldPos.x, worldPos.y, worldPos.z, 1).applyMatrix4(viewMatrix);
      const color = chkDepth.checked ? depthToColor(viewPos.z, camera) : "rgba(255,255,255,0.9)";

      // Update the 3D sphere material color
      const mesh = pointsGroup.children[i];
      mesh.material.color.setStyle(color);
      // And update marker border to match
      marker.style.background = color;
      marker.style.opacity = 0.95;
    });

    // Show matrices (shortened)
    const toStr = (m) => {
      // return a compact string of 4x4 matrix
      const e = m.elements;
      const rows = [];
      for (let r = 0; r < 4; r++) {
        const row = [];
        for (let c = 0; c < 4; c++) {
          row.push(Number(e[c + r * 4]).toFixed(3));
        }
        rows.push(row.join(" "));
      }
      return rows.join("\n");
    };

    // compute a sample MVP for the first point so user can inspect
    const sample = projectPointWithMVP(points[0].clone().applyMatrix4(pointsGroup.matrixWorld), camera);

    matricesPre.textContent = `-- View Matrix --\n${toStr(sample.viewMatrix)}\n\n-- Projection Matrix --\n${toStr(sample.projMatrix)}\n\n-- MVP Matrix (proj * view) --\n${toStr(sample.mvpMatrix)}
\n\n(note: projected NDC of point[0] = ${sample.ndc.x.toFixed(3)}, ${sample.ndc.y.toFixed(3)}, ${sample.ndc.z.toFixed(3)} | clipW=${sample.clipW.toFixed(3)})`;

    renderer.render(scene, camera);
  }

  // Start
  animate();
}
