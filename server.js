const express = require('express');
const cors = require('cors');
// --- FIX: robust import that handles both styles ---
const getInstagramMedia = require("instagram-url-direct");
const instagramGetUrl = getInstagramMedia.default || getInstagramMedia; 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url || !url.includes('instagram.com')) {
            return res.status(400).json({ success: false, message: "Invalid URL provided." });
        }

        console.log("Processing URL:", url);

        // Call the library function
        const links = await instagramGetUrl(url);

        console.log("Instagram Response:", links); // Log the result for debugging

        if (!links || links.results_number === 0) {
            return res.status(404).json({ success: false, message: "Media not found. Account might be private." });
        }

        // Get the first video URL
        const videoData = links.url_list[0];

        res.json({
            success: true,
            title: "Instagram Video", 
            thumbnail: "https://via.placeholder.com/600x600?text=Instagram+Video", 
            downloadUrl: videoData
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, message: "Failed to process video. Server Error." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
