import { Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      {/* Static URL: url.com/login */}
      <Route path="/login" element={<Profile />} />

      {/* Static URL: url.com/ (Home/Dashboard) */}
      <Route path="/" element={<Profile />} />

      {/* Dynamic URL: url.com/story/1, url.com/story/42 */}
      {/* <Route path="/story/:id" element={<StoryPage />} /> */}
    </Routes>
  );
}

export default App;