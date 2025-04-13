const { Client, GatewayIntentBits, VoiceState } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const path = require('path');
const { createReadStream } = require('fs');

// Discord bot token - store this in an environment variable in production
const DISCORD_TOKEN = 'MTM0NzI3MDkyMDcxNjQxOTIwMg.GJrvjq.uP5ilRdEFnGPDkOmJaRV6dFs1WF2c3erT_5t0M';

// Audio player states for logging
const AUDIO_STATES = {
  [AudioPlayerStatus.Idle]: 'Idle',
  [AudioPlayerStatus.Buffering]: 'Buffering',
  [AudioPlayerStatus.Playing]: 'Playing',
  [AudioPlayerStatus.AutoPaused]: 'AutoPaused',
  [AudioPlayerStatus.Paused]: 'Paused',
};

// Create a Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Create an audio player with proper configuration
const player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Play
  }
});

// Log audio player state changes
player.on('stateChange', (oldState, newState) => {
  console.log(`Audio player state changed from ${AUDIO_STATES[oldState.status]} to ${AUDIO_STATES[newState.status]}`);
});

// Handle when the bot is ready
client.once('ready', () => {
  console.log(`✅ ${client.user.tag} is ready to welcome users!`);
});

// Handle voice state updates (when users join/leave voice channels)
client.on('voiceStateUpdate', async (oldState, newState) => {
  // Handle when a user joins a voice channel or switches between channels
  if ((!oldState.channelId && newState.channelId) || (oldState.channelId !== newState.channelId && newState.channelId)) {
    try {
      // Create a connection to the voice channel
      const connection = joinVoiceChannel({
        channelId: newState.channelId,
        guildId: newState.guild.id,
        adapterCreator: newState.guild.voiceAdapterCreator,
      });

      // Set up connection error handling
      connection.on('error', error => {
        console.error('Voice connection error:', error);
        connection.destroy();
      });

      console.log('Creating audio resource from welcome.mp3...');
      const resource = createAudioResource(path.join(__dirname, 'welcome.mp3'), {
        inlineVolume: true,
        inputType: 'arbitrary'
      });

      // Add error handling for the resource
      if (!resource) {
        console.error('Failed to create audio resource');
        return;
      }

      // Set volume to 100%
      resource.volume.setVolume(1.0);

      // Subscribe the connection to the audio player
      connection.subscribe(player);
      console.log('Connected to voice channel and subscribed to audio player');

      // Add a 1-second delay before playing to ensure connection is stable
      setTimeout(() => {
        // Play the welcome sound
        player.play(resource);
        console.log('Started playing welcome sound');
      }, 1000);

      // Handle when the audio finishes playing
      const onIdle = () => {
        console.log('Audio playback finished');
        player.removeListener(AudioPlayerStatus.Idle, onIdle);
        player.stop();
        
        try {
          setTimeout(() => {
            if (connection.state.status !== 'destroyed') {
              connection.destroy();
              console.log('Connection destroyed after playback');
            }
          }, 500); // Add a small delay before destroying the connection
        } catch (error) {
          console.error('Error during connection cleanup:', error);
        }
      };

      player.once(AudioPlayerStatus.Idle, onIdle);

      // Handle errors
      player.on('error', error => {
        console.error('Error in audio player:', error);
        connection.destroy();
      });

      // Handle disconnection
      connection.on('stateChange', (oldState, newState) => {
        if (newState.status === 'destroyed') {
          player.stop();
          console.log('Voice connection destroyed');
        }
      });

    } catch (error) {
      console.error('Error playing welcome sound:', error);
    }
  }
});

// Handle errors
client.on('error', error => {
  console.error('Discord client error:', error);
});

// Login with the bot token
// Login with Soul Auora's token
client.login('');
