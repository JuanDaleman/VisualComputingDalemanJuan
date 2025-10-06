import * as THREE from 'three';

class MaterialManager {
    constructor() {
        this.materials = new Map();
        this.textures = new Map();
        this.textureLoader = new THREE.TextureLoader();
        
        this.setupDefaultMaterials();
    }

    setupDefaultMaterials() {
        // Create basic PBR materials
        this.createMetalMaterial();
        this.createConcreteMaterial();
        this.createWoodMaterial();
        this.createGlassMaterial();
    }

    createMetalMaterial() {
        const material = new THREE.MeshStandardMaterial({
            name: 'MetalMaterial',
            color: 0x4682B4,
            metalness: 0.95,
            roughness: 0.15,
            envMapIntensity: 1.0
        });
        
        this.materials.set('metal', material);
        return material;
    }

    createConcreteMaterial() {
        const material = new THREE.MeshStandardMaterial({
            name: 'ConcreteMaterial',
            color: 0xB4B4AF,
            metalness: 0.0,
            roughness: 0.8,
            envMapIntensity: 0.3
        });
        
        this.materials.set('concrete', material);
        return material;
    }

    createWoodMaterial() {
        const material = new THREE.MeshStandardMaterial({
            name: 'WoodMaterial',
            color: 0x8B4513,
            metalness: 0.0,
            roughness: 0.6,
            envMapIntensity: 0.2
        });
        
        this.materials.set('wood', material);
        return material;
    }

    createGlassMaterial() {
        const material = new THREE.MeshPhysicalMaterial({
            name: 'GlassMaterial',
            color: 0xffffff,
            metalness: 0.0,
            roughness: 0.0,
            transmission: 0.9,
            transparent: true,
            opacity: 0.3,
            envMapIntensity: 1.0
        });
        
        this.materials.set('glass', material);
        return material;
    }

    async loadPBRTextures(basePath, materialName) {
        console.log(`🎨 Loading PBR textures for: ${materialName}`);
        
        const texturePromises = {
            color: this.loadTexture(`${basePath}/${materialName}_Color.jpg`),
            normal: this.loadTexture(`${basePath}/${materialName}_NormalGL.jpg`),
            roughness: this.loadTexture(`${basePath}/${materialName}_Roughness.jpg`),
            metalness: this.loadTexture(`${basePath}/${materialName}_Metalness.jpg`),
            displacement: this.loadTexture(`${basePath}/${materialName}_Displacement.jpg`),
            ao: this.loadTexture(`${basePath}/${materialName}_AmbientOcclusion.jpg`)
        };
        
        try {
            const textures = {};
            
            // Load textures with error handling
            for (const [key, promise] of Object.entries(texturePromises)) {
                try {
                    textures[key] = await promise;
                    console.log(`✅ Loaded ${key} texture for ${materialName}`);
                } catch (error) {
                    console.log(`⚠️ Could not load ${key} texture for ${materialName}`);
                    textures[key] = null;
                }
            }
            
            // Create material with loaded textures
            return this.createPBRMaterial(materialName, textures);
            
        } catch (error) {
            console.error(`❌ Error loading textures for ${materialName}:`, error);
            return this.createFallbackMaterial(materialName);
        }
    }

    loadTexture(path) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                (texture) => {
                    // Configure texture settings
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.generateMipmaps = true;
                    texture.flipY = false;
                    
                    resolve(texture);
                },
                undefined, // onProgress
                (error) => reject(error)
            );
        });
    }

    createPBRMaterial(name, textures) {
        const material = new THREE.MeshStandardMaterial({
            name: `PBR_${name}`,
            map: textures.color,
            normalMap: textures.normal,
            roughnessMap: textures.roughness,
            metalnessMap: textures.metalness,
            displacementMap: textures.displacement,
            aoMap: textures.ao,
            
            // Default PBR values
            metalness: textures.metalness ? 1.0 : 0.0,
            roughness: textures.roughness ? 1.0 : 0.5,
            
            // Displacement settings
            displacementScale: textures.displacement ? 0.02 : 0,
            
            // AO settings
            aoMapIntensity: textures.ao ? 0.5 : 0,
            
            envMapIntensity: 1.0
        });
        
        this.materials.set(name.toLowerCase(), material);
        console.log(`✅ Created PBR material: ${name}`);
        
        return material;
    }

    createFallbackMaterial(name) {
        const colors = {
            metal: 0x4682B4,
            concrete: 0xB4B4AF,
            wood: 0x8B4513,
            pavingStones: 0x696969
        };
        
        const material = new THREE.MeshStandardMaterial({
            name: `Fallback_${name}`,
            color: colors[name.toLowerCase()] || 0x808080,
            roughness: 0.5,
            metalness: name.toLowerCase().includes('metal') ? 0.8 : 0.0
        });
        
        this.materials.set(name.toLowerCase(), material);
        return material;
    }

    // Procedural materials
    createProceduralCheckerboard(size = 8, color1 = 0xffffff, color2 = 0x000000) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        const tileSize = canvas.width / size;
        
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const isEven = (x + y) % 2 === 0;
                context.fillStyle = isEven ? `#${color1.toString(16).padStart(6, '0')}` : `#${color2.toString(16).padStart(6, '0')}`;
                context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.5,
            metalness: 0.0
        });
        
        this.materials.set('checkerboard', material);
        return material;
    }

    createProceduralStripes(stripeWidth = 16, color1 = 0xff0000, color2 = 0x0000ff) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        for (let x = 0; x < canvas.width; x += stripeWidth * 2) {
            context.fillStyle = `#${color1.toString(16).padStart(6, '0')}`;
            context.fillRect(x, 0, stripeWidth, canvas.height);
            
            context.fillStyle = `#${color2.toString(16).padStart(6, '0')}`;
            context.fillRect(x + stripeWidth, 0, stripeWidth, canvas.height);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.4,
            metalness: 0.0
        });
        
        this.materials.set('stripes', material);
        return material;
    }

    createProceduralNoise(scale = 0.1, color = 0x808080) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        const imageData = context.createImageData(canvas.width, canvas.height);
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = Math.random();
            const value = Math.floor(noise * 255);
            
            imageData.data[i] = value;     // R
            imageData.data[i + 1] = value; // G
            imageData.data[i + 2] = value; // B
            imageData.data[i + 3] = 255;   // A
        }
        
        context.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.7,
            metalness: 0.0,
            color: color
        });
        
        this.materials.set('noise', material);
        return material;
    }

    getMaterial(name) {
        return this.materials.get(name.toLowerCase());
    }

    getAllMaterials() {
        return Array.from(this.materials.entries());
    }

    applyMaterialToObject(object, materialName) {
        const material = this.getMaterial(materialName);
        if (!material) {
            console.warn(`Material '${materialName}' not found`);
            return;
        }
        
        if (object.isMesh) {
            object.material = material;
            console.log(`Applied material '${materialName}' to ${object.name || 'unnamed object'}`);
        }
    }

    updateMaterialProperty(materialName, property, value) {
        const material = this.getMaterial(materialName);
        if (material && material[property] !== undefined) {
            material[property] = value;
            material.needsUpdate = true;
        }
    }

    getMaterialInfo() {
        return {
            count: this.materials.size,
            materials: Array.from(this.materials.entries()).map(([name, material]) => ({
                name,
                type: material.type,
                color: material.color?.getHex(),
                metalness: material.metalness,
                roughness: material.roughness,
                transparent: material.transparent,
                hasTextures: {
                    map: !!material.map,
                    normalMap: !!material.normalMap,
                    roughnessMap: !!material.roughnessMap,
                    metalnessMap: !!material.metalnessMap
                }
            }))
        };
    }
}

export default MaterialManager;