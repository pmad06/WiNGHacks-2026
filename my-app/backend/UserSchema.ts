import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
        firstName: String, 
        lastName: String,
        email: String,
        username: String,
        password: String,
        gender:{
                type: String, 
                enum: ["female", "male", "nonbinary", "other"],
                required: false
        },
        dietaryRestrictions: [String],
        symptoms: [String],
        diagnoses: [String],

});

export const User = mongoose.model("User", UserSchema);