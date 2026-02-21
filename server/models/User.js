import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false // 🔥 important security detail
        },

        yearsOfExperience: {
            type: Number,
            default: 0
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        isVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: String,
        verificationTokenExpire: Date,

        resetPasswordToken: String,
        resetPasswordExpire: Date,

        targetRoles: {
            type: [String],
            default: []
        }
    },
    { timestamps: true }
);

// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();

//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
const User = mongoose.model("User", userSchema);
export default User;