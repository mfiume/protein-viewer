/**
 * ARIA Protein Viewer - Main Application Logic
 */

let viewer;
let currentProtein = null;
let isRotating = false;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initializeViewer();

    // Auto-load SHANK3 by default
    setTimeout(() => {
        loadDefaultProtein();
    }, 500);
});

function initializeViewer() {
    const container = document.getElementById('viewerContainer');
    const config = { backgroundColor: 'white' };
    viewer = $3Dmol.createViewer(container, config);
}

async function loadDefaultProtein() {
    // Load a representative SHANK3 structure
    // 6N7Q is a SHANK3 SAM domain structure
    await loadProteinByPDB('6N7Q', 'SHANK3');
}

async function loadProteinByPDB(pdbId, geneName = null) {
    try {
        showInfo('Loading protein structure...');

        const response = await fetch(`/api/pdb/${pdbId}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to load protein');
        }

        const pdbData = await response.text();

        // Clear previous structure
        viewer.clear();

        // Add the structure
        viewer.addModel(pdbData, 'pdb');

        // Set default style
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } });

        // Render
        viewer.zoomTo();
        viewer.render();

        // Show controls
        document.getElementById('viewerControlsInline').style.display = 'flex';

        // Display protein info
        displayProteinInfo(pdbId, geneName);

        currentProtein = { pdbId, geneName };

    } catch (error) {
        showError(error.message);
    }
}

function displayProteinInfo(pdbId, geneName) {
    const infoDiv = document.getElementById('proteinInfo');

    let info = `<strong>PDB ID:</strong> ${pdbId}`;

    if (geneName) {
        info += `<br><strong>Gene:</strong> ${geneName}`;
    }

    info += `<br><strong>Structure Source:</strong> RCSB Protein Data Bank`;
    info += `<br><strong>Controls:</strong> Click and drag to rotate, scroll to zoom`;

    infoDiv.innerHTML = info;
}

function openProteinSearch() {
    document.getElementById('proteinSidebar').style.display = 'flex';
}

function closeSidebar() {
    document.getElementById('proteinSidebar').style.display = 'none';
}

async function searchGene() {
    const geneName = document.getElementById('geneSearch').value.trim();
    const resultsDiv = document.getElementById('searchResults');

    if (!geneName) {
        showError('Please enter a gene name');
        return;
    }

    resultsDiv.innerHTML = '<p style="color: #86868b; padding: 12px;">Searching...</p>';

    try {
        const response = await fetch(`/api/search/${geneName}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Search failed');
        }

        if (!data.results || data.results.length === 0) {
            resultsDiv.innerHTML = '<p style="color: #86868b; padding: 12px;">No proteins found</p>';
            return;
        }

        // Display results
        resultsDiv.innerHTML = '';

        data.results.forEach(protein => {
            const item = document.createElement('div');
            item.className = 'result-item';

            const primaryAccession = protein.primaryAccession;
            const proteinName = protein.proteinDescription?.recommendedName?.fullName?.value ||
                protein.uniProtkbId || 'Unknown';
            const genes = protein.genes?.map(g => g.geneName?.value).filter(Boolean).join(', ') || 'N/A';
            const organism = protein.organism?.scientificName || 'Unknown';

            // Try to find PDB cross-references
            const pdbRefs = protein.uniProtKBCrossReferences?.filter(ref => ref.database === 'PDB') || [];

            item.innerHTML = `
                <div class="result-name">${proteinName}</div>
                <div class="result-gene">Gene: ${genes}</div>
                <div class="result-info">${organism} · ${primaryAccession}</div>
                ${pdbRefs.length > 0 ? `<div class="result-info">${pdbRefs.length} PDB structure(s) available</div>` : ''}
            `;

            item.onclick = () => {
                if (pdbRefs.length > 0) {
                    // Load first available PDB structure
                    const pdbId = pdbRefs[0].id;
                    loadProteinByPDB(pdbId, genes.split(',')[0]);
                    closeSidebar();
                } else {
                    showError('No 3D structure available for this protein');
                }
            };

            resultsDiv.appendChild(item);
        });

    } catch (error) {
        resultsDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

async function loadPDBById() {
    const pdbId = document.getElementById('pdbInput').value.trim();

    if (!pdbId) {
        showError('Please enter a PDB ID');
        return;
    }

    await loadProteinByPDB(pdbId);
    closeSidebar();
}

function toggleRotation() {
    const checkbox = document.getElementById('rotateToggle');
    isRotating = checkbox.checked;

    if (isRotating) {
        viewer.rotate(1, { x: 0, y: 1, z: 0 });
    } else {
        viewer.rotate(0);
    }
}

function changeStyle() {
    const style = document.getElementById('styleSelect').value;
    const color = document.getElementById('colorSelect').value;

    viewer.setStyle({}, {});

    const styleConfig = {};
    styleConfig[style] = { color: color };

    viewer.setStyle({}, styleConfig);
    viewer.render();
}

function changeColor() {
    changeStyle(); // Color change uses the same logic as style change
}

function showInfo(message) {
    const infoDiv = document.getElementById('proteinInfo');
    infoDiv.innerHTML = `<p>${message}</p>`;
}

function showError(message) {
    const infoDiv = document.getElementById('proteinInfo');
    infoDiv.innerHTML = `<div class="error">Error: ${message}</div>`;
}
