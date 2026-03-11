import React, { useEffect, useState } from "react";
import { apiRequest } from "../../config/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const userId = storedUser?.id;
      if (!userId) {
        setError("No logged-in user found.");
        return;
      }

      try {
        const profile = await apiRequest(`/users/${userId}`);
        setUser(profile);
      } catch {
        setError("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading profile...</p>;

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      <h2>Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
    </div>
  );
}

export default Profile;
