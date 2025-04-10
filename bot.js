require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Create a single bot instance with all required intents
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Emoji pool for reactions
const EMOJI_POOL = [
  '😂', '🔥', '💀', '😎', '🤡', '👻', '🥵', '🐸', '😴',
  '🤯', '🦄', '💩', '🥳', '🥶', '👽', '🚀', '🦖', '🐙',
  '🧠', '👑', '😈', '🫠', '🫥', '💫', '🌶️', '🐍', '👀',
  '🗿', '📸', '📿', '🙈', '👹', '🤓', '🙃', '🧌', '🍷',
  '🎃', '🕶️', '📢', '🥴', '😵‍💫', '🧍', '💃', '🪩', '🍿'
];

// Channel IDs
const QUOTE_CHANNEL_ID = '1358302000881733670';
const WALLPAPER_CHANNEL_ID = '1360021331235573800'; // Replace with your wallpaper channel ID

// Quote fetching function
async function fetchQuote() {
  try {
    const res = await fetch('https://zenquotes.io/api/random');
    const data = await res.json();
    return `"${data[0].q}" — *${data[0].a}*`;
  } catch (err) {
    console.error('❌ Failed to fetch quote:', err);
    return "Failed to fetch quote!";
  }
}

// Wallpaper fetching function
async function fetchWallpaper() {
  try {
    const width = 3840;
    const height = 2160;
    const imageId = Math.floor(Math.random() * 1000);
    return {
      url: `https://picsum.photos/id/${imageId}/${width}/${height}`,
      photographer: 'Lorem Picsum',
      photographerUrl: 'https://picsum.photos',
      description: 'Beautiful 4K Wallpaper'
    };
  } catch (err) {
    console.error('❌ Failed to fetch wallpaper:', err);
    return null;
  }
}

// Bot ready event
bot.once('ready', () => {
  console.log(`✅ Soul Auora is ready as ${bot.user.tag}`);

  // Schedule quote every hour
  cron.schedule('0 * * * *', async () => {
    const channel = bot.channels.cache.get(QUOTE_CHANNEL_ID);
    if (channel) {
      const quote = await fetchQuote();
      channel.send(quote);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  // Schedule wallpaper every hour
  cron.schedule('0 * * * *', async () => {
    const channel = bot.channels.cache.get(WALLPAPER_CHANNEL_ID);
    if (channel) {
      const wallpaper = await fetchWallpaper();
      if (wallpaper) {
        const embed = {
          color: 0x0099ff,
          title: wallpaper.description,
          url: wallpaper.photographerUrl,
          author: {
            name: `Photo by ${wallpaper.photographer} on Unsplash`,
            url: wallpaper.photographerUrl,
            icon_url: 'https://unsplash.com/favicon.ico'
          },
          image: {
            url: wallpaper.url
          },
          timestamp: new Date(),
          footer: {
            text: '4K Daily Wallpaper'
          }
        };
        
        await channel.send({ embeds: [embed] });
      }
    }
  }, {
    timezone: 'Asia/Kolkata'
  });
});

// Message event handler
bot.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Handle emoji reactions
  const numberOfReactions = Math.floor(Math.random() * 6) + 1; // 1–6
  const chosen = [];

  while (chosen.length < numberOfReactions) {
    const emoji = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
    if (!chosen.includes(emoji)) chosen.push(emoji);
  }

  for (const emoji of chosen) {
    try {
      await message.react(emoji);
    } catch (e) {
      console.warn(`❌ Could not react with ${emoji}:`, e.message);
    }
  }

  console.log(`🎉 Reacted with ${chosen.length} emoji(s).`);

  // Handle quote command
  if (message.content === '!quote') {
    const quote = await fetchQuote();
    message.channel.send(quote);
  }

  // Handle wallpaper command
  if (message.content === '!wallpaper') {
    const wallpaper = await fetchWallpaper();
    if (wallpaper) {
      const embed = {
        color: 0x0099ff,
        title: wallpaper.description,
        url: wallpaper.photographerUrl,
        author: {
          name: `Photo by ${wallpaper.photographer} on Unsplash`,
          url: wallpaper.photographerUrl,
          icon_url: 'https://unsplash.com/favicon.ico'
        },
        image: {
          url: wallpaper.url
        },
        timestamp: new Date(),
        footer: {
          text: '4K Wallpaper on Demand'
        }
      };
      
      await message.channel.send({ embeds: [embed] });
    } else {
      message.channel.send('Sorry, I couldn\'t fetch a wallpaper at the moment.');
    }
  }
});

// Login with Soul Auora's token
bot.login('MTM0NzI3MDkyMDcxNjQxOTIwMg.GJrvjq.uP5ilRdEFnGPDkOmJaRV6dFs1WF2c3erT_5t0M');
