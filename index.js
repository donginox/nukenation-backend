require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:8080',
  'https://nukenations.netlify.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: "Nuke Nation Backend: ¡Bienvenido al caos digital!" });
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

client.once('ready', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

app.get('/api/discord/members', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    const members = await guild.members.fetch();
    const memberList = members
      .filter((member) => !member.user.bot)
      .map((member) => ({
        id: member.id,
        username: member.user.username,
        displayName: member.displayName,
        avatar: member.user.avatarURL() || 'https://i.pravatar.cc/150',
        status: member.presence?.status || 'offline',
      }));
    res.json(memberList);
  } catch (error) {
    console.error('Error al obtener miembros:', error);
    res.status(500).json({ error: 'Error al obtener miembros de Discord' });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN).then(() => {
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}).catch((error) => {
  console.error('Error al conectar el bot:', error);
});