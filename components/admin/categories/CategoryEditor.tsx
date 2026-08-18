"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import { getCategoryEmoji } from "@/lib/getCategoryEmoji";

import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/repositories/category.repository";

import type { Category } from "@/types/category";

import CategoryForm from "./CategoryForm";
import CategoryList from "./CategoryList";

import { Dispatch, SetStateAction, useState } from "react";

interface CategoryEditorProps {
  restaurantId: string;
  categories: Category[];
  setCategories: Dispatch<SetStateAction<Category[]>>;
}

export default function CategoryEditor({
  restaurantId,
  categories,
  setCategories,
}: CategoryEditorProps) {
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  function handleCreate() {
    setEditingCategory(null);
    setShowForm(true);
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategory(id);

      setCategories((prev) =>
        prev.filter(
          (category) => category.id !== id
        )
      );

    } catch (error) {
      console.error(error);

      alert(
        "No fue posible eliminar la categoría."
      );
    }
  }

  async function handleSave(
  data: Omit<Category, "id" | "emoji">
) {
  try {

    if (editingCategory) {

      const updatedCategory =
        await updateCategory({
          ...editingCategory,
          ...data,
          emoji: getCategoryEmoji(
            data.name
          ),
        });

      setCategories((prev) =>
        prev.map((category) =>
          category.id ===
          editingCategory.id
            ? updatedCategory
            : category
        )
      );

    } else {

      const newCategory =
        await createCategory(
          restaurantId,
          {
            id: "",
            emoji: getCategoryEmoji(
              data.name
            ),
            ...data,
          }
        );

      setCategories((prev) => [
        ...prev,
        newCategory,
      ]);
    }

    setEditingCategory(null);
    setShowForm(false);

  } catch (error) {

    console.error(error);

    alert(
      "No fue posible guardar la categoría."
    );
  }
}

  function handleCancel() {
    setEditingCategory(null);
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <Card
        title="Categorías"
        description="Organiza los productos del restaurante."
        actions={
          <Button
            onClick={handleCreate}
          >
            Nueva categoría
          </Button>
        }
      >
        <CategoryList
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      {showForm && (
        <CategoryForm
          category={editingCategory}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}