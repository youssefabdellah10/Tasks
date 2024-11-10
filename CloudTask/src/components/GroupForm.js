import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { ref, push } from "firebase/database";

function GroupForm() {
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const groupsRef = ref(db, "groups");
      await push(groupsRef, {
        name: groupName,
        type: groupType,
      });
      setGroupName("");
      setGroupType("");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Group Type"
        value={groupType}
        onChange={(e) => setGroupType(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export default GroupForm;