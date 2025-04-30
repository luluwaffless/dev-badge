import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } from 'discord.js';
import { readFileSync, writeFileSync } from 'node:fs';

let { token, clientId, channelId, userId, lastMessage } = JSON.parse(readFileSync('config.json', 'utf-8'));
if (new Date().getTime() - lastMessage > 2592000000) {
    console.log('badge reactivation required, running bot...');

    // registering commands
    (async () => {
        const rest = new REST({ version: '10' }).setToken(token);
        await rest.put(Routes.applicationCommands(clientId), { body: [new SlashCommandBuilder().setName('badge').setDescription('reactivate your badge!').toJSON()] });
    })();

    // creating client
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    client.once('ready', async () => {
        console.log('bot is ready! run /badge in the server!');
        if (channelId && userId) {
            const channel = await client.channels.fetch(channelId);
            await channel.send(`<@${userId}> badge reactivation required! run \`/badge\`!`);
        };
    });
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;
        if (interaction.commandName === 'badge') {
            channelId = interaction.channelId;
            userId = interaction.user.id;
            lastMessage = new Date().getTime();
            await interaction.reply({ content: `badge reactivated successfully! if this is the first time activating, you must set this server as a community, wait for 24 hours and then claim the badge [here](https://discord.com/developers/active-developer)\nyou will need to reactivate <t:${Math.floor((lastMessage + 2592000000) / 1000)}:R>.` });
            writeFileSync('config.json', JSON.stringify({ token, clientId, channelId, userId, lastMessage }));
            process.exit(0);
        };
    });
    client.login(token);
} else {
    console.log('last command was executed less than 30 days ago, goodbye!');
    process.exit(0);
};