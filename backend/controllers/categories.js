import Category from "../models/Category.js";
import Entry from "../models/Entry.js";

// GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ owner: req.userId }).sort({
      name: 1,
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error("getCategories error:", error.message);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Case-insensitive duplicate check for this user
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      owner: req.userId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "A category with this name already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
      owner: req.userId,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("createCategory error:", error.message);
    res.status(500).json({ message: "Failed to create category" });
  }
};

// DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    // Check if any entries reference this category
    const entryCount = await Entry.countDocuments({
      category: req.params.id,
      owner: req.userId,
    });

    if (entryCount > 0) {
      return res.status(400).json({
        message: `Cannot delete: ${entryCount} expense ${entryCount === 1 ? "entry uses" : "entries use"} this category. Reassign them first.`,
      });
    }

    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    console.error("deleteCategory error:", error.message);
    res.status(500).json({ message: "Failed to delete category" });
  }
};
