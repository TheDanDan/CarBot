import { Client, ClientOptions } from "discord.js";
import interactionCreate from "./listeners/interactionCreate";
import ready from "./listeners/ready";

console.log("Bot is starting...");

const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages", "MessageContent"]
});

ready(client);
interactionCreate(client);

client.login(token);