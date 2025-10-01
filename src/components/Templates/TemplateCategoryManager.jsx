import { useState } from "react";

const TemplateCategoryManager = ({ categories, onUpdateCategories }) => {
  const [showManager, setShowManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory = {
      id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      name: newCategoryName,
      icon: newCategoryIcon || "📁"
    };

    onUpdateCategories([...categories, newCategory]);
    setNewCategoryName("");
    setNewCategoryIcon("");
  };

  if (!showManager) {
    return (
      <button
        onClick={() => setShowManager(true)}
        className="text-xs text-gray-500 hover:text-gray-700"
      >
        Manage Categories
      </button>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-700">Manage Categories</h4>
        <button
          onClick={() => setShowManager(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-1 px-2 py-1 text-sm border rounded"
        />
        <input
          type="text"
          placeholder="Icon"
          value={newCategoryIcon}
          onChange={(e) => setNewCategoryIcon(e.target.value)}
          className="w-16 px-2 py-1 text-sm border rounded"
          maxLength="2"
        />
        <button
          onClick={addCategory}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      
      <div className="space-y-1">
        {categories.filter(c => c.id !== 'all').map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-2 bg-white rounded">
            <span className="text-sm">
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </span>
            {!['geometry', 'algebra', 'calculus', 'statistics', 'latex', 'custom'].includes(cat.id) && (
              <button
                onClick={() => onUpdateCategories(categories.filter(c => c.id !== cat.id))}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateCategoryManager;
