import { Document, model, Model, models, Schema } from "mongoose";

export interface ITags extends Document {
    _id: string;
    tags: {
        owner: string;
        content: string;
        name: string;
        uses: number;
        createdAt: number;
    }[];
}

export const tag = new Schema({
    _id: {
        type: String,
        required: true,
    },
    tags: {
        type: [
            {
                owner: {
                    type: String,
                    required: true,
                },
                content: {
                    type: String,
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                uses: {
                    type: Number,
                    default: 0,
                },
                createdAt: {
                    type: Number,
                    requried: true,
                },
            },
        ],
        default: [],
    },
});

const tags = (models["tags"] as Model<ITags>) || model<ITags>("tags", tag);

export default tags;
