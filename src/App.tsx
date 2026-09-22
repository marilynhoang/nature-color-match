import { Route, BrowserRouter, Routes } from "react-router-dom";
import Extractor from "./pages/Extractor";
import Library from "./pages/Library";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Extractor />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </BrowserRouter>
  );
}
