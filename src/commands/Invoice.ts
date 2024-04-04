import { CommandInteraction, Client, ApplicationCommandType, Message, ApplicationCommandOptionType, Collection, MessageReaction, TextBasedChannel } from "discord.js";
import { Command } from "../Command";
import { users } from "./users";
import * as fs from 'fs';

function isValidDate(start_month: any, 
                      start_year: any, 
                      end_month: any, 
                      end_year: any,
                      timeStamp: number): boolean {
  if(start_month < 0 || end_month < 0 || end_year < 0 || start_year < 0){
    return false;
  }
  if(start_month >= 12 || end_month >= 12){
    return false;
  }
  let startDate = new Date(start_year, start_month);
  let endDate = new Date(end_year, end_month);
  let msgDate = new Date(timeStamp);
  
  return msgDate > startDate && msgDate < endDate;
}

export const Invoice: Command = {
    name: "invoice",
    description: "sends the invoice of the carpool data",
    type: ApplicationCommandType.ChatInput,
    options: [
      {
          name: "start_month",
          description: "Start month (default: previous month)",
          type: ApplicationCommandOptionType.Integer,
      },
      {
          name: "start_year",
          description: "Start year (default: current year)",
          type: ApplicationCommandOptionType.Integer,
      },
      {
          name: "end_month",
          description: "End month (default: current month)",
          type: ApplicationCommandOptionType.Integer,
      },
      {
          name: "end_year",
          description: "End year (default: current year)",
          type: ApplicationCommandOptionType.Integer,
      },
    ],

    run: async (client: Client, interaction: CommandInteraction) => {
        try {
          // Check if interaction.channel is defined
          if (!interaction.channel) {
            await interaction.reply({ content: 'Channel not found.' });
            return;
          }
          
          // Fetch the last 10 messages in the channel
          const messages = await interaction.channel.messages.fetch({ limit: 100 });

          const args = interaction.options;

          const startMonth = args.get("start_month")?.value || new Date().getMonth() - 1;
          const startYear = args.get("start_year")?.value || new Date().getFullYear();
          const endMonth = args.get("end_month")?.value || new Date().getMonth();
          const endYear = args.get("end_year")?.value || new Date().getFullYear();

          // Filter out bot messages (if needed)
          const filteredMessages = messages.filter((message) => !message.author.bot && 
                                                                message.content.length > 0 && 
                                                                message.content[0] === "$" &&
                                                                isValidDate(startMonth, startYear, endMonth, endYear, message.createdTimestamp)
                                                                );
    
          // Create a string containing the content of the fetched messages
          let historyText = 'Calculating ...\n';
          await interaction.reply({ content: historyText });

          let costs = calculateCosts(filteredMessages);
          recalcCosts(costs);

          let file = exportToCSV(costs, interaction.channel);

          // let output = "";
          

          // // const users = ["", "A", "B", "D", "E", "J", "N"];
          // // for(const e of users){
          // //   output += e.padStart(5);
          // // }
          // // output += "\n";
          // // for (let i = 0; i < costs.length - 1; i++) {
          // //   output += users[i + 1].trimStart() + ": ";
          // //   for (let j = 0; j < costs.length; j++) {
          // //     output += costs[i][j].toFixed(2).padStart(5);
          // //   }
          // //   output += "\n";
          // // }
          
          // interaction.channel.send(output);
        } catch (error) {
          console.error(error);
          await interaction.reply({ content: 'An error occurred while fetching the message history.' });
        }
    }
};

function calculateCosts(messages: Collection<string, Message<boolean>>) : number[][]{
  const gas = 9.78;
  const parking = 11.34;

  const costArr: number[][] = [];

  const valuesArray = [...users.values()];
  const keysArray = [...users.keys()];
  const maxValue = Math.max(...valuesArray) + 1;

  for (let i = 0; i < maxValue; i++) {
    costArr.push([]); // Initialize each row as an empty array
    for (let j = 0; j < maxValue; j++) {
      costArr[i].push(0); // Set each element to 0
    }
  }

  if (messages) {
    messages.forEach((message: Message) => {
      const driver = users.get(message.author.id);
      if(driver != undefined){

        const matchingReactions = message.reactions.cache.filter((reaction) =>
          reaction.emoji.name != null && keysArray.includes(reaction.emoji.name)
        );

        let cost : number;

        cost = 3.14 + Math.floor(Math.random() * 13) / 10;

        // let size = matchingReactions.size;
        // cost = (parking + gas)/(2 * size) + 1;

        matchingReactions.forEach((reaction: MessageReaction) => {
          if(reaction.emoji.name != null){
            const pass = users.get(reaction.emoji.name);
            if(pass != undefined){
              costArr[pass][driver] += cost;
            }
          }
        });
      }
    });
  }
  console.log(costArr);
  return costArr;
}

function exportToCSV(costArr: number[][], channel: TextBasedChannel) {
  const filePath = 'src/output/carpool' + new Date().valueOf().toString() + ".csv";
  console.log(filePath);
  const users = ["", "A", "B", "D", "E", "J", "N"];
  let content = users.toString();
  
  content += "\n";
  for (let i = 0; i < costArr.length; i++) {
    content += `${users[i + 1]} :, ${costArr[i]}\n`;
  }

  // Use fs.writeFile to write to the file asynchronously
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error('Error writing to the file:', err);
    } else {
      console.log('File has been written successfully.');
    }
  });
  console.log("written");

  channel.send({ files: [filePath] });
}
function recalcCosts(costArr: number[][]){
  for (let i = 0; i < costArr.length; i++) {
    for (let j = 0; j < costArr.length; j++) {
      const x = i + 1;
      const y = j + i + 1;
      
      let ower: number = costArr[x][y];
      let owee: number = costArr[y][x];
      
      if (ower > owee) {
          costArr[y][x] = 0;
          costArr[x][y] = ower - owee;
      } else if (ower === owee) {
          costArr[y][x] = 0;
          costArr[x][y] = 0;
      } else {
          costArr[y][x] = owee - ower;
          costArr[x][y] = 0;
      }
    }
  }
}