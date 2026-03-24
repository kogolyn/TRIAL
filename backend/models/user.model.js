import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role:{
        type: String,
        required: true,
        enum: ["admin", "dispatcher", "ambulance", "hospital", "medical", "reporter"],
    },
    ambulanceId: {
      type: String,
      trim: true,
      uppercase: true,
      required: function requiredAmbulanceId() {
        return this.role === "ambulance";
      },
    },
    password: {
      type: String,
      required: true,
    },
    mustResetPassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);
export default User;
