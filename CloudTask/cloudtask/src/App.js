import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GroupForm from "./components/GroupForm";
import GroupList from "./components/GroupList";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<GroupForm />} />
          <Route path="/list" element={<GroupList />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;