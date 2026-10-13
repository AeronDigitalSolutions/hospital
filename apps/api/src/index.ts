import { createApp } from './app.js';
import { env } from '@chikitsaalye/config';
import { prisma } from '@chikitsaalye/database';

const app = createApp();
const PORT = env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏥 Chikitsaalye Enterprise Healthcare OS - API Service`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`🩺 Health endpoint:   http://localhost:${PORT}/api/v1/health`);
  console.log(`🏢 Facility Context:  ${env.HOSPITAL_NAME} (${env.HOSPITAL_CODE})`);
  console.log(`=======================================================`);
});

// Graceful shutdown handling
async function shutdown(signal: string) {
  console.log(`[Chikitsaalye API] Received ${signal}. Gracefully terminating clinical processes...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('[Chikitsaalye API] Database connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('[Chikitsaalye API] Error during teardown:', err);
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
