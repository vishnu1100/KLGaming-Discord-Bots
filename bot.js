require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// ========== BOT 1: Emoji Reaction Bot ==========
const bot1 = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const EMOJI_POOL = [
  '😂', '🔥', '💀', '😎', '🤡', '👻', '🥵', '🐸', '😴',
  '🤯', '🦄', '💩', '🥳', '🥶', '👽', '🚀', '🦖', '🐙',
  '🧠', '👑', '😈', '🫠', '🫥', '💫', '🌶️', '🐍', '👀',
  '🗿', '📸', '📿', '🙈', '👹', '🤓', '🙃', '🧌', '🍷',
  '🎃', '🕶️', '📢', '🥴', '😵‍💫', '🧍', '💃', '🪩', '🍿'
];

bot1.once('ready', () => {
  console.log(`✅ Emoji Bot is ready as ${bot1.user.tag}`);
});

bot1.on('messageCreate', async (message) => {
  if (message.author.bot) return;

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
});

// ========== BOT 2: Daily Quote Bot ==========
const bot2 = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const CHANNEL_ID = '1358302000881733670';

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

bot2.once('ready', () => {
  console.log(`✅ Quote Bot is ready as ${bot2.user.tag}`);

  // Daily 5:00 AM quote (Asia/Kolkata)
  cron.schedule('0 5 * * *', async () => {
    const channel = bot2.channels.cache.get(CHANNEL_ID);
    if (channel) {
      const quote = await fetchQuote();
      channel.send(quote);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });
});

bot2.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content === '!quote') {
    const quote = await fetchQuote();
    message.channel.send(quote);
  }
});


// ========== LOGIN BOTH BOTS ==========
bot1.login('MTM0MzY3MzU3Mzc0MjczOTQ3OQ.Gs9LP0.pBAtb6PSQgKa5w6TSnG4Dslysq_vdoamlY94aU');         // bot name Arjyou 
bot2.login('MTM0NzI3MDkyMDcxNjQxOTIwMg.GJrvjq.uP5ilRdEFnGPDkOmJaRV6dFs1WF2c3erT_5t0M');  // bot name Soul Auora
