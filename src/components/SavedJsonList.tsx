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
    <pre style={{ padding: "1rem", border: "1px solid #ddd", background: "#f9f9f9" }}>
      {JSON.stringify(jsonData, null, 2)}
    </pre>
  );
};

const SavedJsonList: React.FC<SavedJsonListProps> = ({ savedJsons, setSavedJsons }) => {
  const [editingJson, setEditingJson] = useState<JsonData | null>(null);
  const [jsonTextArea, setJsonTextArea] = useState("");
  const [error, setError] = useState("");

  const handleJsonLoad = () => {
    try {
      const parsedJson = JSON.parse(jsonTextArea);
      setSavedJsons([...savedJsons, parsedJson]); // Update the savedJsons state with the loaded JSON
      setEditingJson(parsedJson);
      setError("");
      setJsonTextArea(""); // Clear the JSON textarea after loading
      localStorage.setItem("savedJsons", JSON.stringify([...savedJsons, parsedJson])); // Save the updated savedJsons to local storage
    } catch (error) {
      setError("Invalid JSON. Please check your input.");
    }
  };

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

      // Immediately download the JSON
      handleDownload(editingJson);
    }
  };

  const handleInputChange = (key: string, value: string | number | boolean, parentKey?: string) => {
    if (editingJson) {
      const updatedJson = { ...editingJson };

      if (parentKey) {
        updateNestedValue(updatedJson, parentKey, key, value);
      } else {
        updatedJson[key] = value;
      }

      setEditingJson(updatedJson);
    }
  };

  const updateNestedValue = (
    json: JsonData,
    parentKey: string,
    targetKey: string,
    value: string | number | boolean
  ) => {
    const keys = parentKey.split(".");
    let currentJson = json;
    for (const key of keys) {
      currentJson = currentJson[key] as JsonData;
    }
    currentJson[targetKey] = value;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getValueForKey = (json: any, key: string) => {
    const keys = key.split(".");
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

  const renderInputs = (jsonData: JsonData, parentKey = "") => {
    return Object.entries(jsonData).map(([key, value]) => {
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
                  <div>
                    <input
                      type="checkbox"
                      checked={getValueForKey(editingJson, inputKey) === true}
                      onChange={(e) => handleInputChange(key, e.target.checked, parentKey)}
                    />
                    <span style={{ marginLeft: "0.5rem" }}>
                      {getValueForKey(editingJson, inputKey) ? "true" : "false"}
                    </span>
                  </div>
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
      <textarea
        value={jsonTextArea}
        onChange={(e) => setJsonTextArea(e.target.value)}
        style={{ width: "100%", minHeight: "100px", marginBottom: "1rem" }}
        placeholder="Paste your JSON here..."
      />
      <button onClick={handleJsonLoad} style={{ marginRight: "1rem" }}>
        Load JSON
      </button>
      <span style={{ color: "red" }}>{error}</span>
      {editingJson && (
        <div style={{ marginBottom: "1rem", border: "1px solid #ddd", padding: "1rem" }}>
          <h3>Edit JSON:</h3>
          {renderInputs(editingJson, "")}
          <button onClick={handleUpdate} style={{ marginRight: "1rem" }}>
            Update and Download
          </button>
          <button onClick={handleCancelEdit}>Cancel</button>
        </div>
      )}

      {savedJsons.map((json, index) => (
        <div key={index} style={{ marginBottom: "1rem", border: "1px solid #ddd", padding: "1rem" }}>
          {!editingJson && (
            <div>
              <h3>Regular JSON Display:</h3>
              <RegularJsonDisplay jsonData={json} />
              <button onClick={() => handleEdit(index)} style={{ marginRight: "1rem" }}>
                Edit
              </button>
              <button onClick={() => handleDownload(json)}>Download</button>
              <button onClick={() => handleDelete(index)}>Delete</button>
              {renderInputs(json, "")}
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
