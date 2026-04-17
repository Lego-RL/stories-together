import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import CreateStory from "./pages/CreateStory";
import ViewStory from "./pages/ViewStory";
import Contribute from "./pages/Contribute";
import StoryPath from "./pages/StoryPath";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AllStories from "./pages/AllStories";
import { useProactiveTokenRefresh } from "./hooks/useTokenRefresh";

function App() {
  useProactiveTokenRefresh();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      {/* profile  */}
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />

      {/* landing page */}
      <Route path="/" element={<Home />} />
      <Route path="/stories" element={<AllStories />} />

      <Route path="/create-story" element={<CreateStory />}  />

      {/* dynamic urls */}
      <Route path="/story/:id" element={<ViewStory />} />
      <Route path="/story/:id/contribute" element={<Contribute />} />
      <Route path="/story/passages/:passage_id/path" element={<StoryPath />} />

      {/* admin panel */}
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;