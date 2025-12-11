"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Check, ChevronDown, Plus, Folder, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  order: number;
  _count?: {
    tasks: number;
  };
}

interface CategoryPickerProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const PRESET_COLORS = [
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#3B82F6", // blue
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#6B7280", // gray
];

export function CategoryPicker({
  value,
  onChange,
  className,
  placeholder = "No category",
  disabled = false,
}: CategoryPickerProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[4]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open, fetchCategories]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          color: newCategoryColor,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCategories([...categories, data.category]);
        onChange(data.category.id);
        setNewCategoryName("");
        setIsCreating(false);
        setOpen(false);
      }
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === value);

  if (!session?.user) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between gap-2 font-normal",
            !value && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          {selectedCategory ? (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span className="truncate">{selectedCategory.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Folder className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{placeholder}</span>
            </div>
          )}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            {isLoading ? (
              <div className="p-2 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                <CommandEmpty>No categories found.</CommandEmpty>
                <CommandGroup>
                  {/* No category option */}
                  <CommandItem
                    value="none"
                    onSelect={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>No category</span>
                    </div>
                    {!value && <Check className="ml-auto h-4 w-4" />}
                  </CommandItem>

                  {/* Category list */}
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => {
                        onChange(category.id);
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                        {category._count && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {category._count.tasks}
                          </span>
                        )}
                      </div>
                      {value === category.id && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                {/* Create new category */}
                <CommandGroup>
                  {isCreating ? (
                    <div className="p-2 space-y-2">
                      <Input
                        placeholder="Category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleCreateCategory();
                          } else if (e.key === "Escape") {
                            setIsCreating(false);
                            setNewCategoryName("");
                          }
                        }}
                        autoFocus
                        className="h-8"
                      />
                      <div className="flex items-center gap-1">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={cn(
                              "w-5 h-5 rounded-full border-2 transition-all",
                              newCategoryColor === color
                                ? "border-foreground scale-110"
                                : "border-transparent hover:scale-105",
                            )}
                            style={{ backgroundColor: color }}
                            onClick={() => setNewCategoryColor(color)}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-7"
                          onClick={handleCreateCategory}
                          disabled={!newCategoryName.trim() || isSaving}
                        >
                          {isSaving ? "Creating..." : "Create"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setIsCreating(false);
                            setNewCategoryName("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <CommandItem
                      onSelect={() => setIsCreating(true)}
                      className="text-primary"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Create category</span>
                    </CommandItem>
                  )}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Hook for using categories programmatically
export function useCategories() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    refresh: fetchCategories,
  };
}
