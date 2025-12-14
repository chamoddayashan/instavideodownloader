const express = require('express');
const cors = require('cors');
const instagramGetUrl = require("instagram-url-direct");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middleware
app.use(cors()); // Allows your frontend to access this server
app.use(express.json()); // Allows parsing JSON data sent from frontend

// 2. The Download Endpoint
app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;

        // Basic validation
        if (!url || !url.includes('instagram.com')) {
            return res.status(400).json({ success: false, message: "Invalid URL provided." });
        }

        console.log("Processing URL:", url);

        // 3. Fetch Data from Instagram
        // links represents the fetched data containing video/image URLs
        const links = await instagramGetUrl(url);

        // Check if we got results
        if (!links || links.results_number === 0) {
            return res.status(404).json({ success: false, message: "Media not found. Account might be private." });
        }

        // Extract the first video link (assuming single post)
        // Note: 'url_list' contains the actual media links
        const videoData = links.url_list[0];

        res.json({
            success: true,
            title: "Instagram Video", // Instagram API rarely gives a clean title, so we use a generic one or snippet
            thumbnail: "https://via.placeholder.com/600x600?text=Instagram+Video", // The library might not return a thumb, so we use a placeholder or the video itself
            downloadUrl: videoData
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, message: "Failed to process video. Please try again." });
    }
});

// 4. Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});