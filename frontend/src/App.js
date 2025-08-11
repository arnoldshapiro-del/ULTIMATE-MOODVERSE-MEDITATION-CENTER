import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import UltimateMoodTracker from "./components/UltimateMoodTracker";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

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
      <AuthProvider>
        <NotificationProvider>
          <TestConnection />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<UltimateMoodTracker />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </div>
  );
}

export default App;