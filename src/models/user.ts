import { Document, model, Model, models, Schema } from "mongoose";
import { ISnippet } from "./snippet";

export interface IUser extends Document {
    _id: string;
    color: string;
    bio: string;
    snippets: ISnippet[];
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
});

const users = (models["users"] as Model<IUser>) || model<IUser>("users", user);

export default users;
