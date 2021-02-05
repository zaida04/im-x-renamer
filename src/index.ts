import { Client, Collection } from "discord.js";

const client = new Client({
    // This bot needs literally NOTHING cached, so nuke the message cache since we don't need that.
    messageCacheMaxSize: 1,
    messageCacheLifetime: 5,
    messageSweepInterval: 5,
    
    // Minimal amount of intents needed to receive messages sent in a guild.
    ws: { intents: ["GUILDS", "GUILD_MESSAGES"] },
});

// Globally accessable items
const context = {
    cooldown: new Collection<string, number>(),
    // The words that'll trigger the renames
    trigger: /\b(i'm|im)\b/gi,
    // How long the cooldowns last
    cooldownAmt: process.env.COOLDOWNAMT ? Number(process.env.COOLDOWNAMT) : 60,
};

// Make use of chaining to handle the ready, inhibited (custom), and message event.
client
    .on("ready", () => Logger.log(`Logged in to ${client.user!.tag}`))
    // If something inhibits the bot from acting on a message, log it.
    .on("inhibited", (str: string) => Logger.warn(`[INHIBITED] ${str}`))
    .on("message", async (m) => {
        // If this person is owner, I can't change their nickname. Along with other factors
        if (!m.member?.manageable) return;

        // If I can't manage nicknames, what's the point of life
        if (!m.guild!.me?.hasPermission("MANAGE_NICKNAMES"))
            return client.emit("inhibited", `Don't got MANAGE_NICKNAME perms in ${m.guild!.name} (${m.guild!.id})`);

        // If this person has been renamed recently and is in cooldown
        if (context.cooldown.has(m.author.id)) {
            // If their cooldown has expired (is past the date timestamp) then delete their cooldown and continue
            if (Date.now() > context.cooldown.get(m.author.id)!) context.cooldown.delete(m.author.id);
            else return client.emit("inhibited", "This person's on cooldown!");
        }

        // Run the triggering regexes ("im", "i'm")
        const match = context.trigger.exec(m.content);

        // If the message doesn't a variation of the word im then do nothing
        if (!match || !match[0]) return;

        // If it does, then find the starting index where "im" is located
        const trigger_position = m.content.indexOf(match[0]);

        // Slice the content to only get the part of the message coming *after* "im"
        const new_name = m.content.slice(trigger_position + match.length);

        // If this persons nickname is already going to be what comes after im, or maybe greater than 32 chars, then why bother wasting api calls
        if (new_name === m.member.nickname || new_name.length > 32) return;

        await m.member.setNickname(new_name);

        // Add this person to the cooldown
        context.cooldown.set(m.author.id, Date.now() * (context.cooldownAmt * 1000));
    });

const Logger = {
    base: (type: string, value: string, color: string) => {
        const used_mem: number = process.memoryUsage().heapUsed / 1024 / 1024;

        let outputBuilder = "";

        outputBuilder += `[${new Date().toLocaleTimeString()}|${new Date().toLocaleDateString()}]${color}${
            colors.DIM
        }`.trim();

        outputBuilder += `[${(Math.round(used_mem * 100) / 100).toFixed(2)} MB]}[${type}]:${colors.BRIGHT}`.trim();

        return console.log(outputBuilder, value, colors.RESET);
    },
    log: (value: string, color?: colors) => {
        return Logger.base("INFO", value, color ? color : colors.GREEN);
    },
    warn: (value: string, color?: colors) => {
        return Logger.base("WARN", value, color ? color : colors.YELLOW);
    },
    error: (value: string | Error) => {
        return Logger.base("ERR", value instanceof Error ? value.message : value, colors.RED);
    },
};

enum colors {
    RESET = "\x1b[0m",
    BRIGHT = "\x1b[1m",
    DIM = "\x1b[2m",
    UNDERSCORE = "\x1b[4m",
    BLINK = "\x1b[5m",
    REVERSE = "\x1b[7m",
    HIDDEN = "\x1b[8m",
    BLACK = "\x1b[30m",
    RED = "\x1b[31m",
    GREEN = "\x1b[32m",
    YELLOW = "\x1b[33m",
    BLUE = "\x1b[34m",
    MAGENTA = "\x1b[35m",
    CYAN = "\x1b[36m",
    WHITE = "\x1b[37m",
    BGBLACK = "\x1b[40m",
    BGRED = "\x1b[41m",
    BGGREEN = "\x1b[42m",
    BGYELLOW = "\x1b[43m",
    BGBLUE = "\x1b[44m",
    BGMAGENTA = "\x1b[45m",
    BGCYAN = "\x1b[46m",
    BGWHITE = "\x1b[47m",
}

void client.login();
