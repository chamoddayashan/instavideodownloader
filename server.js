const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- YOUR API CONFIGURATION ---
const RAPID_API_KEY = '91bdc61f0amshcf872cf065a3b49p19f91fjsnf3bec9e40db4';
const RAPID_API_HOST = 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com';

app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url || !url.includes('instagram.com')) {
            return res.status(400).json({ success: false, message: "Invalid URL provided." });
        }

        console.log("Processing via RapidAPI:", url);

        // 1. Prepare the request options
        const options = {
            method: 'GET',
            url: `https://${RAPID_API_HOST}/index`,
            params: { url: url },
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST
            }
        };

        // 2. Send request to RapidAPI
        const response = await axios.request(options);
        const data = response.data;

        // 3. Log data to Railway logs (helps for debugging)
        console.log("API Response:", JSON.stringify(data));

        // 4. Check if video exists
        // This specific API usually returns 'media' as a URL string or an array
        if (!data || (!data.media && !data.video)) {
             return res.status(404).json({ success: false, message: "Video not found. Account might be private." });
        }

        // Logic to extract the video link
        let downloadUrl = data.media; // Primary location
        if (Array.isArray(data.media)) {
            downloadUrl = data.media[0]; // If it's a list, take the first one
        } else if (!downloadUrl && data.video) {
            downloadUrl = data.video; // Fallback for some endpoints
        }

        // 5. Send success response back to Frontend
        res.json({
            success: true,
            title: data.title || "Instagram Video",
            thumbnail: data.thumbnail || "https://via.placeholder.com/600x600?text=Instagram+Video",
            downloadUrl: downloadUrl
        });

    } catch (error) {
        // Detailed error logging
        console.error("RapidAPI Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: "Failed to fetch video. Please try again." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
