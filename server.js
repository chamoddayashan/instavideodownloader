const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- YOUR API CONFIGURATION ---
const RAPID_API_KEY = '91bdc61f0amshcf872cf065a3b49p19f91fjsnf3bec9e40db4';
const RAPID_API_HOST = 'instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com';

app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url || !url.includes('instagram.com')) {
            return res.status(400).json({ success: false, message: "Invalid URL provided." });
        }

        console.log("Processing URL:", url);

        const options = {
            method: 'GET',
            url: `https://${RAPID_API_HOST}/convert`,
            params: { url: url },
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST
            }
        };

        const response = await axios.request(options);
        const data = response.data;
        
        // Log the exact response to see what we get
        console.log("API Response:", JSON.stringify(data));

        // --- FIXED PARSING LOGIC BASED ON YOUR LOGS ---
        let downloadUrl = null;
        let thumbUrl = "https://via.placeholder.com/600x600?text=Instagram+Video";

        // 1. Check if it's inside "media" array (This matches your log!)
        if (data.media && Array.isArray(data.media) && data.media.length > 0) {
            downloadUrl = data.media[0].url;
            thumbUrl = data.media[0].thumbnail || thumbUrl;
        } 
        // 2. Fallback: Check if it's directly at the root (Some videos differ)
        else if (data.url) {
            downloadUrl = data.url;
            thumbUrl = data.thumb || thumbUrl;
        }

        // 3. Handle "Media not available" error
        if (!downloadUrl) {
            console.error("No URL found in data:", data);
            return res.status(404).json({ success: false, message: "Video not found. The account might be private." });
        }

        // Success!
        res.json({
            success: true,
            title: "Instagram Video",
            thumbnail: thumbUrl,
            downloadUrl: downloadUrl
        });

    } catch (error) {
        console.error("Server Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: "Server Error. Please try again." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
