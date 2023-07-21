import React, { useState, useEffect } from "react";
import SavedJsonList from "./SavedJsonList";

interface JsonData {
  [key: string]: {
    [key: string]: never;
  };
}

const App: React.FC = () => {
  const [jsonData, setJsonData] = useState<JsonData>({});
  const [jsonString, setJsonString] = useState("");
  const [savedJsons, setSavedJsons] = useState<JsonData[]>(() => {
    const storedSavedJsons = localStorage.getItem("savedJsons");
    return storedSavedJsons ? JSON.parse(storedSavedJsons) : [];
  });

  useEffect(() => {
    const storedData = localStorage.getItem("jsonData");
    if (storedData) {
      setJsonData(JSON.parse(storedData));
      setJsonString(JSON.stringify(JSON.parse(storedData), null, 2));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("jsonData", JSON.stringify(jsonData));
    setJsonString(JSON.stringify(jsonData, null, 2));
  }, [jsonData]);

  useEffect(() => {
    localStorage.setItem("savedJsons", JSON.stringify(savedJsons));
  }, [savedJsons]);

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsedData = JSON.parse(event.target.value);
      setJsonData(parsedData);
    } catch (error) {
      console.error("Invalid JSON format");
    }
    setJsonString(event.target.value);
  };

  const handleSave = () => {
    const updatedSavedJsons = [...savedJsons, jsonData];
    setSavedJsons(updatedSavedJsons);
    setJsonData({});
    // Trigger download
    const jsonDataString = JSON.stringify(jsonData, null, 2);
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
    <div style={{ padding: "1rem" }}>
      <div>
        <textarea
          value={jsonString}
          onChange={handleTextareaChange}
          style={{ width: "100%", height: "300px", marginBottom: "1rem" }}
        />
        <button onClick={handleSave} style={{ marginRight: "1rem" }}>
          Save JSON & Download
        </button>
        <button onClick={() => setJsonData({})}>Clear</button>
      </div>
      <SavedJsonList savedJsons={savedJsons} setSavedJsons={setSavedJsons} />
    </div>
  );
};

export default App;
