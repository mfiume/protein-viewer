# ARIA Protein Viewer

A browser-based 3D protein structure viewer with a focus on SHANK3 and other proteins.

## Features

- **3D Visualization**: Interactive 3D rendering using 3Dmol.js
- **Gene Search**: Search proteins by gene name using UniProt API
- **PDB Loading**: Direct loading by PDB ID from RCSB Protein Data Bank
- **Multiple Styles**: Cartoon, sphere, stick, and line representations
- **Color Schemes**: Spectrum, chain, secondary structure, and element coloring
- **Auto-rotation**: Optional automatic rotation for better visualization
- **Default Protein**: Auto-loads SHANK3 structure (PDB: 6N7Q) on startup

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open in browser:
   ```
   http://localhost:8081
   ```

## Controls

- **Click and drag**: Rotate the structure
- **Scroll**: Zoom in/out
- **Load Protein**: Opens sidebar to search by gene or load by PDB ID
- **Auto-rotate**: Toggle automatic rotation
- **Style**: Change visualization style (cartoon, sphere, stick, line)
- **Color**: Change color scheme (spectrum, chain, secondary structure, element)

## APIs Used

- **RCSB PDB**: Protein structure data
- **UniProt**: Protein and gene information

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, 3Dmol.js
- **Backend**: Express.js, Node.js
- **APIs**: RCSB PDB, UniProt REST API

## Default Protein

The viewer loads SHANK3 (PDB: 6N7Q) by default, which is the SAM domain structure of the SHANK3 protein.
