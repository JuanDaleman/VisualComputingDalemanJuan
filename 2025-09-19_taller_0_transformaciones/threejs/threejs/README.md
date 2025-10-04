# Project Setup for React Three Fiber

This project is a Vite application using React and TypeScript, integrated with React Three Fiber for 3D rendering.

## Project Structure

```
threejs
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── README.md
├── src
│   ├── App.tsx
│   ├── main.tsx
│   ├── components
│   │   └── CanvasScene.tsx
│   ├── styles
│   │   └── index.css
│   └── vite-env.d.ts
```

## Setup Instructions

1. **Navigate to the `threejs` folder** in your terminal.
   ```bash
   cd e:\University\computacionVisual\VisualComputingDalemanJuan\2025-09-19_taller_0_transformaciones\threejs
   ```

2. **Create a new Vite project** by running:
   ```bash
   npm create vite@latest
   ```
   Follow the prompts to select **React** and **TypeScript**.

3. **Change into the newly created project directory**:
   ```bash
   cd <project-name>
   ```

4. **Install React Three Fiber**:
   ```bash
   npm install @react-three/fiber
   ```

5. **Install Three.js**:
   ```bash
   npm install three
   ```

6. **Ensure your `package.json` includes the necessary scripts** for starting the development server and building the project. The default scripts should suffice.

7. **Create the necessary files and folders** as per the project structure outlined above.

8. **Populate the files** with the appropriate code to set up your React application with React Three Fiber.

## Running the Project

To start the development server, run:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` to view your application.

## Additional Notes

- Make sure to check the documentation for [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) and [Three.js](https://threejs.org/docs/index.html#manual/en/introduction/Introduction) for more advanced usage and features.
- This project is set up to allow for easy expansion and integration of 3D components using React Three Fiber.