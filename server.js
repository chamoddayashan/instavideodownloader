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

        console.log("Processing via SafeSite API:", url);

        // 1. Prepare Request (This API uses GET /convert)
        const options = {
            method: 'GET',
            url: `https://${RAPID_API_HOST}/convert`,
            params: { url: url },
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST
            }
        };

        // 2. Send Request
        const response = await axios.request(options);
        const data = response.data;
        
        console.log("API Response:", JSON.stringify(data)); // See what we get in logs

        // 3. Check for errors
        if (!data) {
             return res.status(404).json({ success: false, message: "No data returned." });
        }
        
        // If the API returns an error message
        if (data.error) {
             return res.status(400).json({ success: false, message: "API Error: " + data.message || "Unknown Error" });
        }

        // 4. Extract Video URL
        // This specific API usually returns { url: "..." } or an array of results
        let downloadUrl = data.url; 
        let thumbUrl = data.thumb || "https://via.placeholder.com/600x600?text=Instagram+Video";

        // Handle case where it returns an array (like a carousel)
        if (Array.isArray(data) && data.length > 0) {
            downloadUrl = data[0].url;
            thumbUrl = data[0].thumb || thumbUrl;
        }

        if (!downloadUrl) {
            return res.status(404).json({ success: false, message: "Video link not found. Account might be private." });
        }

        // 5. Success
        res.json({
            success: true,
            title: data.meta?.title || "Instagram Video",
            thumbnail: thumbUrl,
            downloadUrl: downloadUrl
        });

    } catch (error) {
        console.error("RapidAPI Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: "Server Error. Please try again." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
