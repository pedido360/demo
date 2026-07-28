"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import { getCategoryEmoji } from "@/lib/getCategoryEmoji";

import type { Category } from "@/types/category";

import CategoryForm from "./CategoryForm";
import CategoryList from "./CategoryList";

import { Dispatch, SetStateAction, useState } from "react";

interface CategoryEditorProps {
  categories: Category[];
  setCategories: Dispatch<SetStateAction<Category[]>>;
}

export default function CategoryEditor({
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

  function handleDelete(id: string) {
    setCategories((prev) =>
      prev.filter(
        (category) => category.id !== id
      )
    );
  }

  function handleSave(
    data: Omit<Category, "id" | "emoji">
  ) {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((category) =>
          category.id === editingCategory.id
            ? {
              ...category,
              ...data,
              emoji: getCategoryEmoji(
                data.name
              ),
            }
            : category
        )
      );
    } else {
      setCategories((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          emoji: getCategoryEmoji(
            data.name
          ),
          ...data,
        },
      ]);
    }

    setEditingCategory(null);
    setShowForm(false);
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