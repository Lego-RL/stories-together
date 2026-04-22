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

const METADATA_BY_ROUTE = [
  {
    matches: (path) => path === "/",
    title: "Stories Together",
    description:
      "Collaborate with others to write enthralling stories one passage at a time, or read the stories other community members have already wrote!",
  },
  {
    matches: (path) => path === "/stories",
    title: "All Stories | Stories Together",
    description: "Browse community stories and discover where each path can lead.",
  },
  {
    matches: (path) => path === "/create-story",
    title: "Create Story | Stories Together",
    description: "Start a new collaborative story and invite others to continue it.",
  },
  {
    matches: (path) => /^\/story\/[^/]+$/.test(path),
    title: "View Story | Stories Together",
    description: "Read a story!",
  },
  {
    matches: (path) => /^\/story\/[^/]+\/contribute$/.test(path),
    title: "Contribute | Stories Together",
    description: "Add your passage and determine where the story is headed.",
  },
  {
    matches: (path) => /^\/story\/passages\/[^/]+\/path$/.test(path),
    title: "Story Path | Stories Together",
    description: "Read the whole story up to this passage!",
  },
  {
    matches: (path) => path === "/login",
    title: "Login | Stories Together",
    description: "Sign in to contribute to stories.",
  },
  {
    matches: (path) => path === "/profile",
    title: "Profile | Stories Together",
    description: "View your profile information & passages you've wrote.",
  },
  {
    matches: (path) => path === "/admin",
    title: "Admin | Stories Together",
    description: "Moderate stories & users, view site statistics.",
  },
];

const DEFAULT_METADATA = {
  title: "Stories Together",
  description:
    "Collaborate with others to write enthralling stories one passage at a time, or read the stories other community members have already wrote!",
};

function setMetaTag(selector, attribute, key, content) {
  let metaTag = document.querySelector(selector);

  if (!metaTag) {
    metaTag = document.createElement("meta");
    metaTag.setAttribute(attribute, key);
    document.head.appendChild(metaTag);
  }

  metaTag.setAttribute("content", content);
}

function updateDocumentMetadata({ title, description }) {
  document.title = title;
  setMetaTag('meta[name="description"]', "name", "description", description);
  setMetaTag('meta[property="og:title"]', "property", "og:title", title);
  setMetaTag('meta[property="og:description"]', "property", "og:description", description);
  setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", title);
  setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description);
}

function getMetadataForPath(pathname) {
  return METADATA_BY_ROUTE.find((routeMeta) => routeMeta.matches(pathname)) ?? DEFAULT_METADATA;
}

function App() {
  useProactiveTokenRefresh();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    updateDocumentMetadata(getMetadataForPath(pathname));
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