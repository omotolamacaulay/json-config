import * as React from "react";
import { useState } from "react";

interface JsonData {
  [key: string]: string | number | boolean | JsonData;
}

interface SavedJsonListProps {
  savedJsons: JsonData[];
  setSavedJsons: React.Dispatch<React.SetStateAction<JsonData[]>>;
}

interface RegularJsonDisplayProps {
  jsonData: JsonData;
}

const RegularJsonDisplay: React.FC<RegularJsonDisplayProps> = ({ jsonData }) => {
  return (
    <pre style={{ padding: "1rem" }}>
      {JSON.stringify(jsonData, null, 2)}
    </pre>
  );
};

const SavedJsonList: React.FC<SavedJsonListProps> = ({ savedJsons, setSavedJsons }) => {
  const [editingJson, setEditingJson] = useState<JsonData | null>(null);

  const handleEdit = (index: number) => {
    setEditingJson({ ...savedJsons[index] });
  };

  const handleCancelEdit = () => {
    setEditingJson(null);
  };

  const handleUpdate = () => {
    if (editingJson) {
      const updatedSavedJsons = savedJsons.map((json) =>
        json.id === editingJson.id ? { ...editingJson } : json
      );
      setSavedJsons(updatedSavedJsons);
      setEditingJson(null);
      localStorage.setItem("savedJsons", JSON.stringify(updatedSavedJsons));
    }
  };

  const handleInputChange = (key: string, value: any, parentKey?: string) => {
    if (editingJson) {
      if (parentKey) {
        setEditingJson((prevEditedJson) => ({
          ...prevEditedJson,
          [parentKey]: {
            ...prevEditedJson[parentKey],
            [key]: value,
          },
        }));
      } else {
        setEditingJson((prevEditedJson) => ({
          ...prevEditedJson,
          [key]: value,
        }));
      }
    }
  };

  const getValueForKey = (json: any, key: string) => {
    const keys = key.split('.');
    let value = json;
    for (const k of keys) {
      value = value[k];
      if (value === undefined) break;
    }
    return value;
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

  const handleDelete = (index: number) => {
    const updatedSavedJsons = [...savedJsons];
    updatedSavedJsons.splice(index, 1);
    setSavedJsons(updatedSavedJsons);
    setEditingJson(null);
  };

  const renderInputs = (data: any, parentKey = "") => {
    return Object.entries(data).map(([key, value]) => {
      const inputKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return (
          <div key={inputKey} style={{ marginBottom: "0.5rem", marginLeft: "1rem" }}>
            <strong>{key}</strong>:
            {renderInputs(value, inputKey)}
          </div>
        );
      } else {
        return (
          <div key={inputKey} style={{ marginBottom: "0.5rem", marginLeft: "1rem" }}>
            <strong>{key}</strong>:
            {editingJson ? (
              <div>
                {typeof value === "boolean" ? (
                  <input
                    type="checkbox"
                    checked={getValueForKey(editingJson, inputKey) === true}
                    onChange={(e) => handleInputChange(key, e.target.checked, parentKey)}
                  />
                ) : (
                  <input
                    type="text"
                    value={getValueForKey(editingJson, inputKey)}
                    onChange={(e) => handleInputChange(key, e.target.value, parentKey)}
                  />
                )}
              </div>
            ) : (
              <span style={{ marginLeft: "0.5rem" }}>
                {typeof value === "object" ? JSON.stringify(value) : value.toString()}
              </span>
            )}
          </div>
        );
      }
    });
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      {savedJsons.map((json, index) => (
        <div key={index} style={{ marginBottom: "1rem", border: "1px solid #ddd", padding: "1rem" }}>
          {editingJson && editingJson.id === json.id ? (
            <div>
              {renderInputs(editingJson, "")}
              <button onClick={handleUpdate} style={{ marginRight: "1rem" }}>
                Update
              </button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </div>
          ) : (
            <div>
              {renderInputs(json, "")}
              <button onClick={() => handleEdit(index)} style={{ marginRight: "1rem" }}>
                Edit
              </button>
              <button onClick={() => handleDownload(json)}>Download</button>
              <button onClick={() => handleDelete(index)}>Delete</button>
              <RegularJsonDisplay jsonData={json} />
            </div>
          )}
        </div>
      ))}

      {editingJson ? (
        <div style={{ marginTop: "2rem", border: "1px solid #ddd", padding: "1rem" }}>
          <h3>Regular JSON Display:</h3>
          <RegularJsonDisplay jsonData={editingJson} />
        </div>
      ) : null}
    </div>
  );
};

export default SavedJsonList;
