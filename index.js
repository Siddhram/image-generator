const express = require('express');
const app = express();
app.use(express.json());
require('dotenv').config();
const { fal } = require('@fal-ai/client');

fal.config({
  credentials: process.env.Fal_Key
});

async function generateImage(prompt) {
  try {
    const result = await fal.subscribe("fal-ai/fast-lightning-sdxl", {
      input: {
        prompt: prompt,          
        image_size: "square_hd",  
        num_inference_steps: 4,   
        num_images: 1,            
        format: "jpeg"            
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });
    
    
    return result.data;

  } catch (error) {
    console.error("Error generating image:", error);
    throw error; 
  }
}

app.post('/image', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const imageData = await generateImage(prompt);

    res.status(200).json({
      message: 'Image generated successfully',
      image: imageData
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate image',
      details: error.message
    });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
