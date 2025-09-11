import { YuzuConsumer } from './src/consumer';

async function main() {
  const consumer = new YuzuConsumer();
  
  // Setup graceful shutdown
  consumer.setupGracefulShutdown();
  
  try {
    // Start the consumer
    await consumer.start();
    
    console.log('Yuzu Consumer is running. Press Ctrl+C to stop.');
    
    // Keep the process alive
    await new Promise(() => {});
  } catch (error) {
    console.error('Failed to start consumer:', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});