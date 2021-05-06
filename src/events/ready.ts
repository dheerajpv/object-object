import AeroClient from "@aeroware/aeroclient";
import { EventHandler } from "@aeroware/aeroclient/dist/types";
import mongoose from "mongoose";

export default {
    name: "ready",
    once: true,
    async callback(this: AeroClient) {
        try {
            await mongoose.connect(
                process.env.MONGO_URI!,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useFindAndModify: false,
                    keepAlive: true,
                },
                (err) => {
                    if (err) return this.logger.error(err.stack || err.message);
                    this.logger.success("Connected to mongo");
                }
            );

            mongoose.connection.on("connect", () => {
                this.logger.success("Mongoose is connected");
            });

            mongoose.connection.on("error", (err) => {
                if (err) this.logger.error(err.stack || err.message);
            });

            mongoose.connection.on("disconnect", () => {
                this.logger.warn("Mongoose was disconnected");
            });

            mongoose.connection.on("reconnect", () => {
                this.logger.info("Mongoose has reconnected");
            });
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    },
} as EventHandler;
