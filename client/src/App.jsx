import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import SideBar from './components/SideBar/SideBar';
import { SideBarProvider } from './contexts/SideBarProvider';

function App() {
  return (
    <SideBarProvider>
      <Router>
        <SideBar />
        <Routes>
          <Route index element={<Home />} />
          {/* <Route path="/about" element={<About />} /> */}
        </Routes>
      </Router>
    </SideBarProvider>
  );
}

export default App;
