import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BackgroundAnimation from './components/BackgroundAnimation';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import ViewPage from './pages/ViewPage';
import './App.css';
import AboutUs from './pages/AboutUs';

function App() {
  return (
    <Router>
      <div className="App">
        <BackgroundAnimation />
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/view/:fileId" element={<ViewPage />} />
          <Route path="/aboutUs" element={<AboutUs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
