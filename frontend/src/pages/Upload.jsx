import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Upload is handled via the Create popup in the Sidebar.
// This page redirects home so the /upload route doesn't 404.
export default function Upload() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/", { replace: true }); }, [navigate]);
  return null;
}
