import { Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import CreateStory from "./pages/CreateStory";

function App() {
  return (
    <Routes>
      {/* profile  */}
      <Route path="/login" element={<Profile />} />
      <Route path="/profile" element={<Profile />} />

      {/* landing page */}
      <Route path="/" element={<Home />} />

      <Route path="/create-story" element={<CreateStory />}  />

      {/* Dynamic URL: url.com/story/1, url.com/story/42 */}
      {/* <Route path="/story/:id" element={<StoryPage />} /> */}
    </Routes>
  );
}

export default App;