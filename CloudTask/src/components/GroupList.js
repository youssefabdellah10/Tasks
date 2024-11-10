import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";

function GroupList() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const groupsRef = ref(db, "groups");
    onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      const groupsList = data ? Object.values(data) : [];
      setGroups(groupsList);
    });
  }, []);

  return (
    <div>
      <h2>Group List</h2>
      <ul>
        {groups.map((group, index) => (
          <li key={index}>
            {group.name} - {group.type}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroupList;