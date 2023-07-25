import * as React from "react";
import { useState, useEffect } from "react";
import SavedJsonList from "./SavedJsonList";

interface JsonData {
  [key: string]: string | number | boolean | JsonData;
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

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
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
    handleDownload(jsonData);
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
    <div>
      <h1>JSON Config</h1>
      <div>
        <h3>Edit your JSON directly and download</h3>
        <textarea value={jsonString} onChange={handleTextareaChange} />
        <button onClick={handleSave}>Edit JSON directly & Download</button>
        <button onClick={() => setJsonData({})}>Clear</button>
      </div>
      <h4>Or</h4>
      <h3>Load Input fields for a cooler experience</h3>
      <SavedJsonList savedJsons={savedJsons} setSavedJsons={setSavedJsons} />
    </div>
  );
};

export default App;
