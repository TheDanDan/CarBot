import { CommandInteraction, Client, ApplicationCommandType, Message } from "discord.js";
import { Command } from "../Command";

export const Hello: Command = {
    name: "hello",
    description: "Returns a greeting",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        console.log(interaction.channel?.fetch);
        try {
          // Check if interaction.channel is defined
          if (!interaction.channel) {
            await interaction.followUp({ content: 'Channel not found.', ephemeral: true });
            return;
          }
    
          // Fetch the last 10 messages in the channel
          const messages = await interaction.channel.messages.fetch({ limit: 10 });
          console.log(messages);
    
          // Filter out bot messages (if needed)
          const filteredMessages = messages.filter((message) => !message.author.bot);
    
          // Create a string containing the content of the fetched messages
          let historyText = 'Past 10 messages in this channel:\n';
          if (filteredMessages) {
            filteredMessages.forEach((message: Message) => {
              historyText += `${message.author.username}: ${message.content}\n`;
            });
          }
    
          // Send the history as a follow-up message
          await interaction.followUp({ content: historyText, ephemeral: true });
        } catch (error) {
          console.error(error);
          await interaction.followUp({ content: 'An error occurred while fetching the message history.', ephemeral: true });
        }
    }
    // run: async (client: Client, interaction: CommandInteraction) => {
    //     const content = "Hello there!";

    //     await interaction.followUp({
    //         ephemeral: true,
    //         content
    //     });
    // }
};