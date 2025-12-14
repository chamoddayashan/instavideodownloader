const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- YOUR API CONFIGURATION ---
const RAPID_API_KEY = '91bdc61f0amshcf872cf065a3b49p19f91fjsnf3bec9e40db4';
// We are using the "Instagram Downloader 3205" API now
const RAPID_API_HOST = 'instagram120.p.rapidapi.com';

app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url || !url.includes('instagram.com')) {
            return res.status(400).json({ success: false, message: "Invalid URL provided." });
        }

        console.log("Processing via RapidAPI (3205):", url);

        // 1. Prepare Request
        const options = {
            method: 'GET',
            url: `https://${RAPID_API_HOST}/url`, // This API uses /url endpoint
            params: { url: url },
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST
            }
        };

        // 2. Send Request
        const response = await axios.request(options);
        const data = response.data;

        console.log("API Response:", JSON.stringify(data)); 

        // 3. Validation
        // This API returns data.url_list as an array of links
        if (!data || !data.url_list || data.url_list.length === 0) {
             return res.status(404).json({ success: false, message: "Video not found. Account might be private." });
        }

        // 4. Success - Get the first video link
        const videoUrl = data.url_list[0];

        res.json({
            success: true,
            title: "Instagram Video",
            thumbnail: "https://via.placeholder.com/600x600?text=Video+Found",
            downloadUrl: videoUrl
        });

    } catch (error) {
        console.error("RapidAPI Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: "Failed to fetch video. Please try again." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
