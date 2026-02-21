import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
        firstName: String, 
        lastName: String,
        email: String,
        conditions: [String],
});

export const User = mongoose.model("User", UserSchema);