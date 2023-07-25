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

const RegularJsonDisplay: React.FC<RegularJsonDisplayProps> = ({
  jsonData,
}) => {
  return <pre className="jsonFormat">{JSON.stringify(jsonData, null, 2)}</pre>;
};

const SavedJsonList: React.FC<SavedJsonListProps> = ({
  savedJsons,
  setSavedJsons,
}) => {
  const [editingJson, setEditingJson] = useState<JsonData | null>(null);
  const [jsonTextArea, setJsonTextArea] = useState("");
  const [error, setError] = useState("");

  const handleJsonLoad = () => {
    try {
      const parsedJson = JSON.parse(jsonTextArea);
      //   setSavedJsons([...savedJsons, parsedJson]);
      setEditingJson(parsedJson);
      setError("");
      setJsonTextArea("");
      //   localStorage.setItem(
      //     "savedJsons",
      //     JSON.stringify([...savedJsons, parsedJson])
      //   );
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
      //   localStorage.setItem("savedJsons", JSON.stringify(updatedSavedJsons));
      handleDownload(editingJson);
    }
  };

  const handleInputChange = (
    key: string,
    value: string | number | boolean,
    parentKey?: string
  ) => {
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
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        return (
          <div key={inputKey} className="modelGroup">
            <h4 className="modelKey">{key}</h4>
            {renderInputs(value, inputKey)}
          </div>
        );
      } else {
        return (
          <div key={inputKey} className="modelGroup">
            <strong>{key}</strong>:
            {editingJson ? (
              <div>
                {typeof value === "boolean" ? (
                  <div>
                    <input
                      type="checkbox"
                      checked={getValueForKey(editingJson, inputKey) === true}
                      onChange={(e) =>
                        handleInputChange(key, e.target.checked, parentKey)
                      }
                    />
                    <span>
                      {getValueForKey(editingJson, inputKey) ? "true" : "false"}
                    </span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={getValueForKey(editingJson, inputKey)}
                    onChange={(e) =>
                      handleInputChange(key, e.target.value, parentKey)
                    }
                  />
                )}
              </div>
            ) : (
              <span>
                {typeof value === "object"
                  ? JSON.stringify(value)
                  : value.toString()}
              </span>
            )}
          </div>
        );
      }
    });
  };

  return (
    <div className="jsonListbody">
      <textarea
        value={jsonTextArea}
        onChange={(e) => setJsonTextArea(e.target.value)}
        placeholder="Paste your JSON here..."
      />
      <button onClick={handleJsonLoad}>Load JSON</button>
      <span style={{ color: "red" }}>{error}</span>
      {editingJson && (
        <div className="displaySavedBody">
          <div className="displaySaved">
            <div className="renderInuts">
              <h3>Edit JSON</h3>
              {renderInputs(editingJson, "")}
            </div>
            {editingJson ? (
              <div className="jsonDisplay">
                <h3>Regular JSON Display</h3>
                <RegularJsonDisplay jsonData={editingJson} />
              </div>
            ) : null}
          </div>
          <div className="buttonGroup">
            <button onClick={handleUpdate}>Update and Download</button>
            <button onClick={handleCancelEdit}>Cancel</button>
          </div>
        </div>
      )}

      {savedJsons.map((json, index) => (
        <div key={index} className="displaySavedBody">
          {!editingJson && (
            <div>
              <h3>Regular JSON Display:</h3>
              <div className="displaySaved">
                <div className="jsonDisplay">
                  <RegularJsonDisplay jsonData={json} />
                </div>
                <div className="jsonDisplay">{renderInputs(json, "")}</div>
              </div>
              <div>
                <button onClick={() => handleEdit(index)}>Edit</button>
                <button onClick={() => handleDownload(json)}>Download</button>
                <button onClick={() => handleDelete(index)}>Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SavedJsonList;
