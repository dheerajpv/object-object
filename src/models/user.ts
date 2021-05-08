import { Document, model, Model, models, Schema } from "mongoose";

export interface IUser extends Document {
    _id: string;
}

const user = new Schema({
    _id: String,
});

const users = (models["users"] as Model<IUser>) || model<IUser>("users", user);

export default users;
