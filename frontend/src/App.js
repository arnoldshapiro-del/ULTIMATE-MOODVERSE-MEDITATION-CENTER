import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import MoodTracker from "./components/MoodTracker";
import { Toaster } from "./components/ui/toaster";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TestConnection = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log('Backend connection successful:', response.data.message);
    } catch (e) {
      console.error('Backend connection failed:', e);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return null;
};

function App() {
  return (
    <div className="App">
      <TestConnection />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MoodTracker />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;