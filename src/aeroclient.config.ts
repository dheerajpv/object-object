import { AeroClientOptions } from "@aeroware/aeroclient/dist/types";

export default {
    token: process.env.TOKEN,
    prefix: "$",
    logging: true,
    loggerHeader: "object",
    commandsPath: "./commands",
    eventsPath: "./events",
    messagesPath: "../messages.json",
    connectionUri: process.env.MONGO_URI,
    useDefaults: true,
    persistentCooldowns: true,
    staff: process.env.STAFF?.replace(/\s+/g, "").split(","),
    testServers: process.env.TEST_SERVERS?.replace(/\s+/g, "").split(","),
    logChannel: "", // todo: add something
    disableStaffCooldowns: true,
} as AeroClientOptions;
