import { Schema, model, models, Document, Model } from "mongoose";

const Tags = new Schema({
    _id: String,
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
            },
        ],
        default: [],
    },
});

export interface ITags extends Document {
    _id: string;
    tags: {
        owner: string;
        content: string;
        name: string;
    }[];
}

const tags = (models["tags"] as Model<ITags>) || model<ITags>("tags", Tags);

export default tags;
