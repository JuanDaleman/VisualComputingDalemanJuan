#!/usr/bin/env python3
"""
Script para convertir el notebook de formato XML a JSON válido
"""
import json
import re
from pathlib import Path

def xml_to_notebook(xml_content):
    """Convierte contenido XML de VSCode a formato JSON de Jupyter"""
    
    cells = []
    
    # Extraer todas las celdas del XML
    cell_pattern = r'<VSCode\.Cell id="([^"]*)" language="([^"]*)">(.*?)</VSCode\.Cell>'
    matches = re.findall(cell_pattern, xml_content, re.DOTALL)
    
    for cell_id, language, content in matches:
        # Limpiar el contenido
        content = content.strip()
        
        # Crear celda en formato Jupyter
        cell = {
            "cell_type": "markdown" if language == "markdown" else "code",
            "metadata": {},
            "source": content.split('\n')
        }
        
        if language != "markdown":
            cell["execution_count"] = None
            cell["outputs"] = []
        
        cells.append(cell)
    
    # Crear estructura del notebook
    notebook = {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "codemirror_mode": {
                    "name": "ipython",
                    "version": 3
                },
                "file_extension": ".py",
                "mimetype": "text/x-python",
                "name": "python",
                "nbconvert_exporter": "python",
                "pygments_lexer": "ipython3",
                "version": "3.11.0"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 2
    }
    
    return notebook

def main():
    notebook_path = Path(__file__).parent / "imagen_matriz_pixeles.ipynb"
    
    print(f"📖 Leyendo: {notebook_path}")
    
    # Leer el contenido actual
    with open(notebook_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Verificar si es XML
    if content.strip().startswith('<VSCode.Cell'):
        print("⚠️  Detectado formato XML de VS Code")
        print("🔄 Convirtiendo a JSON...")
        
        # Convertir a JSON
        notebook = xml_to_notebook(content)
        
        # Guardar backup
        backup_path = notebook_path.with_suffix('.ipynb.backup')
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"💾 Backup guardado en: {backup_path}")
        
        # Guardar como JSON
        with open(notebook_path, 'w', encoding='utf-8') as f:
            json.dump(notebook, f, indent=1, ensure_ascii=False)
        
        print("✅ Notebook convertido a JSON válido")
        print(f"📊 Total de celdas: {len(notebook['cells'])}")
    else:
        print("✅ El archivo ya está en formato JSON")

if __name__ == "__main__":
    main()
