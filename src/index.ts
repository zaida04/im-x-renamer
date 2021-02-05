import { Client, Collection } from "discord.js";
const client = new Client({
    messageCacheMaxSize: 1,
    messageCacheLifetime: 5,
    messageSweepInterval: 5,
    partials: ["MESSAGE"],
    ws: { intents: ["GUILDS", "GUILD_MESSAGES"] },
});

const context = {
    cooldown: new Collection<string, number>(),
    trigger: /\b(i'm|im)\b/g,
    cooldownAmt: process.env.COOLDOWNAMT ? Number(process.env.COOLDOWNAMT) : 60,
};

client
    .on("ready", () => Logger.log(`Logged in to ${client.user!.tag}`))
    .on("inhibited", (str: string) => Logger.warn(`[INHIBITED] ${str}`))
    .on("message", async (m) => {
        if (!m.member?.manageable) return;
        if (!m.guild!.me?.hasPermission("MANAGE_NICKNAMES"))
            return client.emit("inhibited", `Don't got MANAGE_NICKNAME perms in ${m.guild!.name} (${m.guild!.id})`);
        if (context.cooldown.has(m.author.id)) {
            if (Date.now() > context.cooldown.get(m.author.id)!) context.cooldown.delete(m.author.id);
            else return client.emit("inhibited", "This person's on cooldown!");
        }

        const m_LC = m.content.toLowerCase();
        const match = context.trigger.exec(m.content);
        if (!match || !match[0]) return;
        const trigger_position = m_LC.indexOf(match[0]);
        if (trigger_position === -1) return;
        const new_name = m.content.slice(trigger_position + match.length);
        if (new_name === m.member.nickname) return;
        await m.member.setNickname(new_name);
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
