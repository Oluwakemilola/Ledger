import Entry from "../models/Entry.js";
import Category from "../models/Category.js";

// GET /api/entries
export const getEntries = async (req, res) => {
  try {
    const entries = await Entry.find({ owner: req.userId })
      .populate("category", "name")
      .sort({ date: -1 });

    res.status(200).json(entries);
  } catch (error) {
    console.error("getEntries error:", error.message);
    res.status(500).json({ message: "Failed to fetch entries" });
  }
};

// POST /api/entries
export const createEntry = async (req, res) => {
  try {
    const { vendor, amount, category, date, notes } = req.body;

    if (!vendor || amount === undefined || !category) {
      return res
        .status(400)
        .json({ message: "Vendor, amount, and category are required" });
    }

    // Verify the category belongs to this user
    const categoryDoc = await Category.findOne({
      _id: category,
      owner: req.userId,
    });
    if (!categoryDoc) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const entry = await Entry.create({
      vendor,
      amount,
      category,
      date: date || Date.now(),
      notes,
      owner: req.userId,
    });

    // Populate category before returning
    await entry.populate("category", "name");

    res.status(201).json(entry);
  } catch (error) {
    console.error("createEntry error:", error.message);
    res.status(500).json({ message: "Failed to create entry" });
  }
};

// PUT /api/entries/:id
export const updateEntry = async (req, res) => {
  try {
    const { vendor, amount, category, date, notes } = req.body;

    // If updating category, verify it belongs to this user
    if (category) {
      const categoryDoc = await Category.findOne({
        _id: category,
        owner: req.userId,
      });
      if (!categoryDoc) {
        return res.status(400).json({ message: "Invalid category" });
      }
    }

    const entry = await Entry.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { vendor, amount, category, date, notes },
      { new: true, runValidators: true }
    ).populate("category", "name");

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.status(200).json(entry);
  } catch (error) {
    console.error("updateEntry error:", error.message);
    res.status(500).json({ message: "Failed to update entry" });
  }
};

// DELETE /api/entries/:id
export const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.status(200).json({ message: "Entry deleted" });
  } catch (error) {
    console.error("deleteEntry error:", error.message);
    res.status(500).json({ message: "Failed to delete entry" });
  }
};
