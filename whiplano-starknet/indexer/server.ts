import express from 'express';
import { HealthMonitor } from './health';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.HEALTH_PORT || 3000;
const healthMonitor = new HealthMonitor();

app.get('/health', async (req, res) => {
  try {
    const health = await healthMonitor.checkHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get health status' });
  }
});

app.get('/health/last', (req, res) => {
  const lastHealth = healthMonitor.getLastHealthCheck();
  if (lastHealth) {
    res.json(lastHealth);
  } else {
    res.status(404).json({ error: 'No health check data available' });
  }
});

app.listen(port, () => {
  console.log(`Health monitoring server running on port ${port}`);
}); 