// Add at the top with other imports
const { RateLimiter } = require('limiter');
const limiter = new RateLimiter({ tokensPerInterval: 1, interval: "second" });

// In your message handling function
app.post('/posts', async (req, res) => {
  try {
    await limiter.removeTokens(1);
    // ... rest of your post handling code ...
  } catch (error) {
    res.status(429).json({ error: 'Rate limit exceeded' });
  }
});