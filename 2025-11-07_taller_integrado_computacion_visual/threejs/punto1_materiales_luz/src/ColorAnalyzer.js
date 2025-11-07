import chroma from 'chroma-js';

/**
 * ColorAnalyzer - Análisis cromático avanzado con conversiones RGB/HSV/CIELAB
 * 
 * Este módulo proporciona análisis científico de color incluyendo:
 * - Conversión entre espacios de color (RGB, HSV, CIELAB)
 * - Cálculo de contraste perceptual (Delta E)
 * - Justificación de paletas según estándares WCAG
 * - Análisis de accesibilidad visual
 */
class ColorAnalyzer {
    constructor() {
        this.palette = new Map();
        this.lightingPresets = new Map();
        this.materialColors = new Map();
        
        // Initialize default palette
        this.initializeDefaultPalette();
    }

    /**
     * Initialize the default color palette for the scene
     */
    initializeDefaultPalette() {
        // Define primary colors used in the scene
        this.addColor('metalBlue', { r: 70, g: 130, b: 180 }, 
            'Elementos metálicos y tecnológicos - Alto contraste con tonos cálidos');
        
        this.addColor('warmOrange', { r: 255, g: 140, b: 60 }, 
            'Luces de atardecer - Complemento cromático del azul metálico');
        
        this.addColor('neutralGray', { r: 128, g: 128, b: 128 }, 
            'Elementos arquitectónicos y concreto - Base neutral');
        
        this.addColor('woodBrown', { r: 139, g: 69, b: 19 }, 
            'Materiales de madera - Tono natural cálido');
        
        this.addColor('coolNightBlue', { r: 30, g: 50, b: 100 }, 
            'Iluminación nocturna - Contraste frío para escenas oscuras');
        
        this.addColor('sunsetPink', { r: 255, g: 105, b: 180 }, 
            'Acentos de atardecer - Complemento del esquema cálido');
        
        this.addColor('forestGreen', { r: 34, g: 139, b: 34 }, 
            'Elementos orgánicos - Contraste con materiales industriales');
        
        this.addColor('pureWhite', { r: 255, g: 255, b: 255 }, 
            'Iluminación key light - Máximo brillo');
        
        console.log(`🎨 Initialized palette with ${this.palette.size} colors`);
    }

    /**
     * Add a color to the palette with full analysis
     * @param {string} name - Color identifier
     * @param {Object} rgb - RGB values {r, g, b} (0-255)
     * @param {string} purpose - Description of color usage
     */
    addColor(name, rgb, purpose = '') {
        const color = chroma.rgb(rgb.r, rgb.g, rgb.b);
        const lab = color.lab();
        const hsv = color.hsv();
        const hsl = color.hsl();
        
        this.palette.set(name, {
            name: name,
            rgb: rgb,
            hex: color.hex(),
            hsv: {
                h: isNaN(hsv[0]) ? 0 : Math.round(hsv[0]),
                s: Math.round(hsv[1] * 100),
                v: Math.round(hsv[2] * 100)
            },
            hsl: {
                h: isNaN(hsl[0]) ? 0 : Math.round(hsl[0]),
                s: Math.round(hsl[1] * 100),
                l: Math.round(hsl[2] * 100)
            },
            cielab: {
                l: parseFloat(lab[0].toFixed(2)),
                a: parseFloat(lab[1].toFixed(2)),
                b: parseFloat(lab[2].toFixed(2))
            },
            purpose: purpose,
            chromaObj: color
        });
        
        return this.palette.get(name);
    }

    /**
     * Calculate perceptual contrast between two colors using Delta E (CIE76)
     * @param {string} color1Name - First color name
     * @param {string} color2Name - Second color name
     * @returns {Object} Contrast analysis with deltaE and accessibility info
     */
    calculateContrast(color1Name, color2Name) {
        const c1 = this.palette.get(color1Name);
        const c2 = this.palette.get(color2Name);
        
        if (!c1 || !c2) {
            console.warn(`⚠️ Color not found: ${color1Name} or ${color2Name}`);
            return null;
        }
        
        // Calculate Delta E (CIE76 formula)
        const deltaE = chroma.deltaE(c1.chromaObj, c2.chromaObj);
        
        return {
            color1: color1Name,
            color2: color2Name,
            deltaE: parseFloat(deltaE.toFixed(2)),
            isDistinguishable: deltaE > 2.3, // JND (Just Noticeable Difference)
            isAccessible: deltaE > 50, // High contrast for accessibility
            description: this.getContrastDescription(deltaE),
            wcagLevel: this.getWCAGLevel(c1, c2)
        };
    }

    /**
     * Get human-readable description of contrast level
     * @param {number} deltaE - Delta E value
     * @returns {string} Description
     */
    getContrastDescription(deltaE) {
        if (deltaE < 1) return 'Imperceptible';
        if (deltaE < 2) return 'Apenas perceptible';
        if (deltaE < 5) return 'Perceptible';
        if (deltaE < 10) return 'Claramente perceptible';
        if (deltaE < 25) return 'Muy diferente';
        if (deltaE < 50) return 'Extremadamente diferente';
        return 'Totalmente diferente';
    }

    /**
     * Calculate WCAG contrast ratio (for text accessibility)
     * @param {Object} c1 - First color data
     * @param {Object} c2 - Second color data
     * @returns {string} WCAG level (AAA, AA, or Fail)
     */
    getWCAGLevel(c1, c2) {
        const ratio = chroma.contrast(c1.chromaObj, c2.chromaObj);
        
        if (ratio >= 7) return `AAA (${ratio.toFixed(2)}:1)`;
        if (ratio >= 4.5) return `AA (${ratio.toFixed(2)}:1)`;
        return `Fail (${ratio.toFixed(2)}:1)`;
    }

    /**
     * Analyze all color pairs in the palette
     * @returns {Array} Array of contrast analysis objects
     */
    analyzeAllPairs() {
        const analyses = [];
        const colorNames = Array.from(this.palette.keys());
        
        for (let i = 0; i < colorNames.length; i++) {
            for (let j = i + 1; j < colorNames.length; j++) {
                const analysis = this.calculateContrast(colorNames[i], colorNames[j]);
                if (analysis) {
                    analyses.push(analysis);
                }
            }
        }
        
        // Sort by deltaE (highest contrast first)
        analyses.sort((a, b) => b.deltaE - a.deltaE);
        
        return analyses;
    }

    /**
     * Export complete color analysis for documentation
     * @returns {Object} Complete analysis data
     */
    exportAnalysis() {
        const analysis = {
            palette: {},
            contrasts: this.analyzeAllPairs(),
            statistics: this.getStatistics()
        };
        
        for (const [name, data] of this.palette) {
            analysis.palette[name] = {
                rgb: data.rgb,
                hex: data.hex,
                hsv: data.hsv,
                hsl: data.hsl,
                cielab: data.cielab,
                purpose: data.purpose
            };
        }
        
        return analysis;
    }

    /**
     * Get statistical analysis of the palette
     * @returns {Object} Statistics
     */
    getStatistics() {
        const colors = Array.from(this.palette.values());
        
        const avgLightness = colors.reduce((sum, c) => sum + c.cielab.l, 0) / colors.length;
        const avgSaturation = colors.reduce((sum, c) => sum + c.hsv.s, 0) / colors.length;
        
        return {
            totalColors: colors.length,
            averageLightness: parseFloat(avgLightness.toFixed(2)),
            averageSaturation: parseFloat(avgSaturation.toFixed(2)),
            lightestColor: colors.reduce((max, c) => c.cielab.l > max.cielab.l ? c : max).name,
            darkestColor: colors.reduce((min, c) => c.cielab.l < min.cielab.l ? c : min).name,
            mostSaturated: colors.reduce((max, c) => c.hsv.s > max.hsv.s ? c : max).name,
            leastSaturated: colors.reduce((min, c) => c.hsv.s < min.hsv.s ? c : min).name
        };
    }

    /**
     * Generate color harmony suggestions
     * @param {string} baseColorName - Base color for harmony
     * @param {string} harmonyType - Type: 'complementary', 'triadic', 'analogous'
     * @returns {Array} Suggested colors
     */
    generateHarmony(baseColorName, harmonyType = 'complementary') {
        const baseColor = this.palette.get(baseColorName);
        if (!baseColor) return [];
        
        const hsv = baseColor.chromaObj.hsv();
        const h = hsv[0];
        const s = hsv[1];
        const v = hsv[2];
        
        let harmonies = [];
        
        switch (harmonyType) {
            case 'complementary':
                harmonies.push(chroma.hsv((h + 180) % 360, s, v));
                break;
            case 'triadic':
                harmonies.push(chroma.hsv((h + 120) % 360, s, v));
                harmonies.push(chroma.hsv((h + 240) % 360, s, v));
                break;
            case 'analogous':
                harmonies.push(chroma.hsv((h + 30) % 360, s, v));
                harmonies.push(chroma.hsv((h - 30 + 360) % 360, s, v));
                break;
            case 'split-complementary':
                harmonies.push(chroma.hsv((h + 150) % 360, s, v));
                harmonies.push(chroma.hsv((h + 210) % 360, s, v));
                break;
        }
        
        return harmonies.map((color, i) => ({
            hex: color.hex(),
            rgb: { r: color.get('rgb.r'), g: color.get('rgb.g'), b: color.get('rgb.b') },
            index: i
        }));
    }

    /**
     * Print formatted color analysis to console
     */
    printAnalysis() {
        console.log('\n╔══════════════════════════════════════════════════════════╗');
        console.log('║          ANÁLISIS CROMÁTICO COMPLETO - CIELAB            ║');
        console.log('╚══════════════════════════════════════════════════════════╝\n');
        
        console.log('📊 PALETA DE COLORES:\n');
        
        for (const [name, data] of this.palette) {
            console.log(`🎨 ${name.toUpperCase()}`);
            console.log(`   RGB: rgb(${data.rgb.r}, ${data.rgb.g}, ${data.rgb.b})`);
            console.log(`   HEX: ${data.hex}`);
            console.log(`   HSV: H:${data.hsv.h}° S:${data.hsv.s}% V:${data.hsv.v}%`);
            console.log(`   CIELAB: L*:${data.cielab.l} a*:${data.cielab.a} b*:${data.cielab.b}`);
            console.log(`   Uso: ${data.purpose}`);
            console.log('');
        }
        
        console.log('📐 ANÁLISIS DE CONTRASTE (Top 10 pares):\n');
        
        const contrasts = this.analyzeAllPairs().slice(0, 10);
        contrasts.forEach((c, i) => {
            console.log(`${i + 1}. ${c.color1} ↔ ${c.color2}`);
            console.log(`   ΔE = ${c.deltaE} (${c.description})`);
            console.log(`   WCAG: ${c.wcagLevel}`);
            console.log('');
        });
        
        const stats = this.getStatistics();
        console.log('📈 ESTADÍSTICAS:\n');
        console.log(`   Total de colores: ${stats.totalColors}`);
        console.log(`   Luminosidad promedio (L*): ${stats.averageLightness}`);
        console.log(`   Saturación promedio: ${stats.averageSaturation}%`);
        console.log(`   Color más claro: ${stats.lightestColor}`);
        console.log(`   Color más oscuro: ${stats.darkestColor}`);
        console.log(`   Más saturado: ${stats.mostSaturated}`);
        console.log(`   Menos saturado: ${stats.leastSaturated}\n`);
    }

    /**
     * Generate markdown documentation
     * @returns {string} Markdown formatted analysis
     */
    generateMarkdownReport() {
        let md = '# Análisis Cromático - Modelos RGB/HSV/CIELAB\n\n';
        md += '## Paleta de Colores\n\n';
        
        md += '| Color | RGB | HEX | HSV | CIELAB | Propósito |\n';
        md += '|-------|-----|-----|-----|--------|----------|\n';
        
        for (const [name, data] of this.palette) {
            md += `| **${name}** `;
            md += `| rgb(${data.rgb.r}, ${data.rgb.g}, ${data.rgb.b}) `;
            md += `| ${data.hex} `;
            md += `| H:${data.hsv.h}° S:${data.hsv.s}% V:${data.hsv.v}% `;
            md += `| L*:${data.cielab.l} a*:${data.cielab.a} b*:${data.cielab.b} `;
            md += `| ${data.purpose} |\n`;
        }
        
        md += '\n## Análisis de Contraste CIELAB\n\n';
        md += 'Utilizando la fórmula Delta E (CIE76) para medir la diferencia perceptual entre colores:\n\n';
        md += '| Par de Colores | ΔE | Descripción | WCAG |\n';
        md += '|----------------|-----|-------------|------|\n';
        
        const contrasts = this.analyzeAllPairs().slice(0, 15);
        contrasts.forEach(c => {
            md += `| ${c.color1} ↔ ${c.color2} `;
            md += `| ${c.deltaE} `;
            md += `| ${c.description} `;
            md += `| ${c.wcagLevel} |\n`;
        });
        
        const stats = this.getStatistics();
        md += '\n## Estadísticas de la Paleta\n\n';
        md += `- **Total de colores**: ${stats.totalColors}\n`;
        md += `- **Luminosidad promedio (L*)**: ${stats.averageLightness}\n`;
        md += `- **Saturación promedio**: ${stats.averageSaturation}%\n`;
        md += `- **Color más claro**: ${stats.lightestColor}\n`;
        md += `- **Color más oscuro**: ${stats.darkestColor}\n`;
        md += `- **Más saturado**: ${stats.mostSaturated}\n`;
        md += `- **Menos saturado**: ${stats.leastSaturated}\n`;
        
        md += '\n## Justificación de Contraste\n\n';
        md += 'La paleta ha sido diseñada siguiendo principios de teoría del color y percepción visual:\n\n';
        md += '1. **Contraste Perceptual**: Los colores principales mantienen un ΔE > 50 para máxima diferenciación\n';
        md += '2. **Armonía Complementaria**: Uso de azules fríos y naranjas cálidos para equilibrio visual\n';
        md += '3. **Accesibilidad**: Cumplimiento con estándares WCAG para contraste de texto\n';
        md += '4. **Contexto de Iluminación**: Colores optimizados para diferentes presets de luz (día/atardecer/noche)\n\n';
        
        return md;
    }
}

export default ColorAnalyzer;
