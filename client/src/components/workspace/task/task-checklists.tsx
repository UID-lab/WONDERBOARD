import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Plus, MoreHorizontal, Trash2, Edit2, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import API from "@/lib/axios-client";

interface ChecklistItem {
  _id: string;
  text: string;
  completed: boolean;
  order: number;
}

interface Checklist {
  _id: string;
  title: string;
  task: string;
  items: ChecklistItem[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TaskChecklistsProps {
  taskId: string;
}

export const TaskChecklists = ({ taskId }: TaskChecklistsProps) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [editingChecklist, setEditingChecklist] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [editingItem, setEditingItem] = useState<{ checklistId: string; itemId: string } | null>(null);
  const [editItemText, setEditItemText] = useState("");
  const [expandedChecklists, setExpandedChecklists] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChecklists();
  }, [taskId]);

  const fetchChecklists = async () => {
    try {
      const response = await API.get(`/checklist/task/${taskId}`);
      if (response.data.success) {
        const checklistsData = response.data.data;
        setChecklists(checklistsData);
        // Auto-expand checklists by default
        setExpandedChecklists(new Set(checklistsData.map((cl: Checklist) => cl._id)));
      }
    } catch (error) {
      console.error("Error fetching checklists:", error);
    }
  };

  const handleAddChecklist = async () => {
    if (!newChecklistTitle.trim()) return;

    setLoading(true);
    try {
      const response = await API.post("/checklist", {
        title: newChecklistTitle,
        task: taskId,
      });

      if (response.data.success) {
        const newChecklist = response.data.data;
        setChecklists([...checklists, newChecklist]);
        setExpandedChecklists(prev => new Set([...prev, newChecklist._id]));
        setNewChecklistTitle("");
        setIsAddingChecklist(false);
      }
    } catch (error) {
      console.error("Error creating checklist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChecklist = async (checklistId: string, title: string) => {
    try {
      const response = await API.put(`/checklist/${checklistId}`, { title });
      if (response.data.success) {
        setChecklists(checklists.map(cl => 
          cl._id === checklistId ? { ...cl, title } : cl
        ));
      }
    } catch (error) {
      console.error("Error updating checklist:", error);
    }
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    try {
      const response = await API.delete(`/checklist/${checklistId}`);
      if (response.data.success) {
        setChecklists(checklists.filter(cl => cl._id !== checklistId));
      }
    } catch (error) {
      console.error("Error deleting checklist:", error);
    }
  };

  const handleAddItem = async (checklistId: string) => {
    if (!newItemText.trim()) return;

    try {
      const response = await API.post(`/checklist/${checklistId}/items`, {
        text: newItemText,
      });

      if (response.data.success) {
        setChecklists(checklists.map(cl => 
          cl._id === checklistId ? response.data.data : cl
        ));
        setNewItemText("");
        setAddingItemTo(null);
      }
    } catch (error) {
      console.error("Error adding checklist item:", error);
    }
  };

  const handleUpdateItem = async (checklistId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    try {
      const response = await API.put(`/checklist/${checklistId}/items/${itemId}`, updates);
      if (response.data.success) {
        setChecklists(checklists.map(cl => 
          cl._id === checklistId ? response.data.data : cl
        ));
      }
    } catch (error) {
      console.error("Error updating checklist item:", error);
    }
  };

  const handleDeleteItem = async (checklistId: string, itemId: string) => {
    try {
      const response = await API.delete(`/checklist/${checklistId}/items/${itemId}`);
      if (response.data.success) {
        setChecklists(checklists.map(cl => 
          cl._id === checklistId ? response.data.data : cl
        ));
      }
    } catch (error) {
      console.error("Error deleting checklist item:", error);
    }
  };

  const toggleChecklist = (checklistId: string) => {
    setExpandedChecklists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(checklistId)) {
        newSet.delete(checklistId);
      } else {
        newSet.add(checklistId);
      }
      return newSet;
    });
  };

  const getChecklistProgress = (checklist: Checklist) => {
    if (checklist.items.length === 0) return 0;
    const completedItems = checklist.items.filter(item => item.completed).length;
    return Math.round((completedItems / checklist.items.length) * 100);
  };

  const handleEditSave = (checklistId: string) => {
    if (editTitle.trim()) {
      handleUpdateChecklist(checklistId, editTitle);
    }
    setEditingChecklist(null);
    setEditTitle("");
  };

  const handleItemEditSave = (checklistId: string, itemId: string) => {
    if (editItemText.trim()) {
      handleUpdateItem(checklistId, itemId, { text: editItemText });
    }
    setEditingItem(null);
    setEditItemText("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Checklists ({checklists.length})
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAddingChecklist(true)}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Checklist
        </Button>
      </div>

      {/* Add new checklist form */}
      {isAddingChecklist && (
        <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
          <Input
            placeholder="Enter checklist title..."
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddChecklist()}
            className="flex-1"
          />
          <Button size="sm" onClick={handleAddChecklist} disabled={loading}>
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsAddingChecklist(false);
              setNewChecklistTitle("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Checklists */}
      <div className="space-y-3">
        {checklists.map((checklist) => {
          const progress = getChecklistProgress(checklist);
          const isExpanded = expandedChecklists.has(checklist._id);

          return (
            <div key={checklist._id} className="border rounded-lg bg-white">
              <Collapsible open={isExpanded} onOpenChange={() => toggleChecklist(checklist._id)}>
                <div className="flex items-center justify-between p-3 border-b">
                  <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    
                    {editingChecklist === checklist._id ? (
                      <div className="flex gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleEditSave(checklist._id)}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => handleEditSave(checklist._id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingChecklist(null);
                            setEditTitle("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{checklist.title}</span>
                          <span className="text-xs text-gray-500">
                            {checklist.items.filter(item => item.completed).length}/{checklist.items.length}
                          </span>
                        </div>
                        {checklist.items.length > 0 && (
                          <Progress value={progress} className="h-1 mt-1" />
                        )}
                      </div>
                    )}
                  </CollapsibleTrigger>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingChecklist(checklist._id);
                          setEditTitle(checklist.title);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setAddingItemTo(checklist._id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteChecklist(checklist._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CollapsibleContent>
                  <div className="p-3 space-y-2">
                    {/* Add item form */}
                    {addingItemTo === checklist._id && (
                      <div className="flex gap-2 p-2 bg-gray-50 rounded">
                        <Input
                          placeholder="Enter item text..."
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAddItem(checklist._id)}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => handleAddItem(checklist._id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAddingItemTo(null);
                            setNewItemText("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Checklist items */}
                    {checklist.items.map((item) => (
                      <div key={item._id} className="flex items-center gap-2 group">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={(checked) =>
                            handleUpdateItem(checklist._id, item._id, { completed: !!checked })
                          }
                        />

                        {editingItem?.checklistId === checklist._id && editingItem?.itemId === item._id ? (
                          <div className="flex gap-2 flex-1">
                            <Input
                              value={editItemText}
                              onChange={(e) => setEditItemText(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && handleItemEditSave(checklist._id, item._id)}
                              className="flex-1"
                            />
                            <Button size="sm" onClick={() => handleItemEditSave(checklist._id, item._id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingItem(null);
                                setEditItemText("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span
                              className={`flex-1 text-sm ${
                                item.completed
                                  ? "line-through text-gray-500"
                                  : "text-gray-900"
                              }`}
                            >
                              {item.text}
                            </span>

                            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  setEditingItem({ checklistId: checklist._id, itemId: item._id });
                                  setEditItemText(item.text);
                                }}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-600"
                                onClick={() => handleDeleteItem(checklist._id, item._id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {checklist.items.length === 0 && addingItemTo !== checklist._id && (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-xs">No items yet</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAddingItemTo(checklist._id)}
                          className="text-xs mt-1"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add first item
                        </Button>
                      </div>
                    )}

                    {checklist.items.length > 0 && addingItemTo !== checklist._id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAddingItemTo(checklist._id)}
                        className="text-xs w-full mt-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add item
                      </Button>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </div>

      {checklists.length === 0 && !isAddingChecklist && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No checklists yet</p>
          <p className="text-xs">Create checklists to track progress</p>
        </div>
      )}
    </div>
  );
};