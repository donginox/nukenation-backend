const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();

// Configurar CORS
const allowedOrigins = ['https://nukenations.netlify.app', 'http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Configurar cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

// Iniciar el cliente de Discord
client.login(process.env.DISCORD_BOT_TOKEN);

// Ruta de bienvenida
app.get('/api/welcome', (req, res) => {
  res.json({ message: 'Nuke Nation Backend: ¡Bienvenido al caos digital!' });
});

// Endpoint para obtener miembros de Discord
app.get('/api/discord/members', async (req, res) => {
  try {
    if (!client.isReady()) {
      await client.login(process.env.DISCORD_BOT_TOKEN);
    }

    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    const members = await guild.members.fetch();
    const memberList = members.map(member => ({
      id: member.id,
      username: member.user.username,
      displayName: member.displayName || member.user.globalName || member.user.username,
      avatar: member.user.avatarURL() || 'https://i.pravatar.cc/150',
      status: member.presence?.status || 'offline'
    }));

    res.json(memberList);
  } catch (error) {
    console.error('Error fetching Discord members:', error);
    res.status(500).json({ error: 'Failed to fetch Discord members' });
  }
});

// Iniciar el servidor
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});