import { Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import CreateStory from "./pages/CreateStory";
import ViewStory from "./pages/ViewStory";
import Contribute from "./pages/Contribute";
import StoryPath from "./pages/StoryPath";

function App() {
  return (
    <Routes>
      {/* profile  */}
      <Route path="/login" element={<Profile />} />
      <Route path="/profile" element={<Profile />} />

      {/* landing page */}
      <Route path="/" element={<Home />} />

      <Route path="/create-story" element={<CreateStory />}  />

      {/* dynamic urls */}
      <Route path="/story/:id" element={<ViewStory />} />
      <Route path="/story/:id/contribute" element={<Contribute />} />
      <Route path="/story/passages/:passage_id/path" element={<StoryPath />} />
    </Routes>
  );
}

export default App;