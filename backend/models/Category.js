import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: same user can't have two categories with the same name,
// but different users CAN each have a "Marketing" category.
categorySchema.index({ name: 1, owner: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
