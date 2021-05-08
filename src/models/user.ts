import { Document, model, Model, models, Schema } from "mongoose";
import { ISnippet } from "./snippet";

export interface IUser extends Document {
    _id: string;
    color: string;
    bio: string;
    snippets: ISnippet[];
    reputation: number;
    lastThanked: number;
    wasThanked: number;
}

export const user = new Schema({
    _id: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        default: "#000000",
    },
    bio: {
        type: String,
        default: "*No bio.*",
    },
    snippets: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "snippets",
            },
        ],
        default: [],
    },
    reputation: {
        type: Number,
        default: 0,
    },
    lastThanked: {
        type: Number,
        default: 0,
    },
    wasThanked: {
        type: Number,
        default: 0,
    },
});

const users = (models["users"] as Model<IUser>) || model<IUser>("users", user);

export default users;
