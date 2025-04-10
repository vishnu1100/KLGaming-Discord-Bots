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

// Channel ID for daily quotes
const CHANNEL_ID = '1358302000881733670';

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

// Bot ready event
bot.once('ready', () => {
  console.log(`✅ Soul Auora is ready as ${bot.user.tag}`);

  // Schedule daily quote at 5:00 AM (Asia/Kolkata)
  cron.schedule('0 5 * * *', async () => {
    const channel = bot.channels.cache.get(CHANNEL_ID);
    if (channel) {
      const quote = await fetchQuote();
      channel.send(quote);
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
});

// Login with Soul Auora's token
bot.login('MTM0NzI3MDkyMDcxNjQxOTIwMg.GJrvjq.uP5ilRdEFnGPDkOmJaRV6dFs1WF2c3erT_5t0M');
