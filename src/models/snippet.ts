import { Document, model, Model, models, Schema } from "mongoose";

export interface ISnippet extends Document {
    _id: string;
    author: string;
    language: string;
    tags: string[];
    title: string;
    content: string;
    likes: string[];
}

export const snippet = new Schema({
    author: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    likes: {
        type: [String],
        default: [],
    },
});

const snippets =
    (models["snippets"] as Model<ISnippet>) ||
    model<ISnippet>("snippets", snippet);

export default snippets;
