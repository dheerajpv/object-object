import AeroClient, { Arguments } from "@aeroware/aeroclient";
import { config as dotenv } from "dotenv";

dotenv();

(async () => {
    const client = await AeroClient.create();

    client.commands.delete("setprefix");
    client.commands.delete("setlocale");

    Arguments.use(client);
})();
