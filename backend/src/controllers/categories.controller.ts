import type { Request, Response } from "express";
import { prisma } from "../models/index.js";

export async function getAllCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.categories.findMany();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getCategoryById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const category = await prisma.categories.findUnique({
      where: { id: Number(id) }
    });
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createCategory(req: Request, res: Response) {
  const { title, description } = req.body;
  try {
    const newCategory = await prisma.categories.create({
      data: { title, description }
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateCategory(req: Request, res: Response) {
  const { id } = req.params;
  const { title, description } = req.body;
  try {
    const updatedCategory = await prisma.categories.update({
      where: { id: Number(id) },
      data: { title, description }
    });
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(`Error updating category with id ${id}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await prisma.categories.delete({
      where: { id: Number(id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting category with id ${id}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}