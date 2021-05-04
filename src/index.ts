import AeroClient from "@aeroware/aeroclient";
import { config as dotenv } from "dotenv";

dotenv();

(async () => {
    await AeroClient.create();
})();
