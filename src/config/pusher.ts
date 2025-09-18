import { Pusher } from '@pusher/pusher-websocket-react-native';

// Configuration for Pusher
const pusherConfig = {
  apiKey: process.env.PUSHER_APP_KEY || 'your-pusher-app-key',
  cluster: process.env.PUSHER_CLUSTER || 'eu',
  useTLS: true,
  authEndpoint: process.env.PUSHER_AUTH_ENDPOINT || 'https://officially-together-joey.ngrok-free.app/broadcasting/auth',
};

// Get Pusher singleton instance
export const pusherClient = Pusher.getInstance();

// Initialize Pusher with configuration
export const initializePusher = async (): Promise<void> => {
  try {
    await pusherClient.init({
      apiKey: pusherConfig.apiKey,
      cluster: pusherConfig.cluster,
      useTLS: pusherConfig.useTLS,
      authEndpoint: pusherConfig.authEndpoint,
    });
    console.log('Pusher initialized successfully'); // eslint-disable-line no-console
  } catch (error) {
    console.error('Failed to initialize Pusher:', error); // eslint-disable-line no-console
    throw error;
  }
};

// Connect to Pusher
export const connectPusher = async (): Promise<void> => {
  try {
    await pusherClient.connect();
    console.log('Connected to Pusher'); // eslint-disable-line no-console
  } catch (error) {
    console.error('Failed to connect to Pusher:', error); // eslint-disable-line no-console
    throw error;
  }
};

// Disconnect from Pusher
export const disconnectPusher = async (): Promise<void> => {
  try {
    await pusherClient.disconnect();
    console.log('Disconnected from Pusher'); // eslint-disable-line no-console
  } catch (error) {
    console.error('Failed to disconnect from Pusher:', error); // eslint-disable-line no-console
  }
};

// Get socket ID for authentication
export const getSocketId = async (): Promise<string | null> => {
  try {
    const socketId = await pusherClient.getSocketId();
    return socketId;
  } catch (error) {
    console.error('Failed to get socket ID:', error); // eslint-disable-line no-console
    return null;
  }
};