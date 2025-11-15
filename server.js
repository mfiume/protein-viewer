/**
 * ARIA Protein Viewer Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Proxy endpoint for fetching PDB files from RCSB
app.get('/api/pdb/:pdbId', async (req, res) => {
    const pdbId = req.params.pdbId.toUpperCase();

    try {
        const fetch = (await import('node-fetch')).default;
        const url = `https://files.rcsb.org/download/${pdbId}.pdb`;

        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Failed to fetch PDB file: ${response.statusText}`
            });
        }

        const pdbData = await response.text();
        res.setHeader('Content-Type', 'text/plain');
        res.send(pdbData);
    } catch (error) {
        console.error('Error fetching PDB:', error);
        res.status(500).json({ error: error.message });
    }
});

// Search proteins by gene name using UniProt API
app.get('/api/search/:geneName', async (req, res) => {
    const geneName = req.params.geneName;

    try {
        const fetch = (await import('node-fetch')).default;
        const url = `https://rest.uniprot.org/uniprotkb/search?query=gene:${geneName}+AND+reviewed:true&format=json&size=10`;

        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Failed to search proteins: ${response.statusText}`
            });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error searching proteins:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`ARIA Protein Viewer running at http://localhost:${PORT}`);
});
