import { Command } from "./Command";
import { Hello } from "./commands/Hello";
import { Invoice } from "./commands/Invoice";

export const Commands: Command[] = [Invoice, Hello];