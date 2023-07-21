import React, { Key, useState } from "react";

interface JsonData {
  [key: string]: {
    [key: string]: never;
  };
}

interface SavedJsonListProps {
  savedJsons: JsonData[];
  setSavedJsons: React.Dispatch<React.SetStateAction<JsonData[]>>;
}

const SavedJsonList: React.FC<SavedJsonListProps> = ({ savedJsons, setSavedJsons }) => {
  const [editingJsonIndex, setEditingJsonIndex] = useState<number | null>(null);
  const [editedJson, setEditedJson] = useState<JsonData>({});

  const handleEdit = (index: number) => {
    setEditedJson(savedJsons[index]);
    setEditingJsonIndex(index);
  };

  const handleCancelEdit = () => {
    setEditedJson({});
    setEditingJsonIndex(null);
  };

  const handleSaveEdit = () => {
    const updatedSavedJsons = [...savedJsons];
    updatedSavedJsons[editingJsonIndex as number] = editedJson;
    setSavedJsons(updatedSavedJsons);
    setEditedJson({});
    setEditingJsonIndex(null);
  };

  const handleDelete = (index: number) => {
    const updatedSavedJsons = [...savedJsons];
    updatedSavedJsons.splice(index, 1);
    setSavedJsons(updatedSavedJsons);
    setEditingJsonIndex(null);
  };

  const handleDownload = (json: JsonData) => {
    const jsonDataString = JSON.stringify(json, null, 2);
    const blob = new Blob([jsonDataString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      {savedJsons.map((json: JsonData, index: Key | null | undefined) => (
        <div key={index} style={{ marginBottom: "1rem", border: "1px solid #ddd", padding: "1rem" }}>
          {editingJsonIndex === index ? (
            <div>
              <textarea
                value={JSON.stringify(editedJson, null, 2)}
                onChange={(e) => setEditedJson(JSON.parse(e.target.value))}
                style={{ width: "100%", height: "200px", marginBottom: "1rem" }}
              />
              <button onClick={handleSaveEdit} style={{ marginRight: "1rem" }}>
                Save
              </button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </div>
          ) : (
            <div>
              <pre>{JSON.stringify(json, null, 2)}</pre>
              <button onClick={() => handleEdit(index)} style={{ marginRight: "1rem" }}>
                Edit
              </button>
              <button onClick={() => handleDelete(index)}>Delete</button>
              <button onClick={() => handleDownload(json)} style={{ marginLeft: "1rem" }}>
                Download
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SavedJsonList;
