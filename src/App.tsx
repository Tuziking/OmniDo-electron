import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Focus from './pages/Focus';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import Habits from './pages/Habits';
import Inspiration from './pages/Inspiration';
import InspirationEditor from './pages/InspirationEditor';

import ProjectDetails from './pages/ProjectDetails';
import HabitDetails from './pages/HabitDetails';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/focus" replace />} />
          <Route path="focus" element={<Focus />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="habits" element={<Habits />} />
          <Route path="habits/:id" element={<HabitDetails />} />
          <Route path="inspiration" element={<Inspiration />} />
        </Route>
        <Route path="/inspiration/new" element={<InspirationEditor />} />
        <Route path="/inspiration/edit/:id" element={<InspirationEditor />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
