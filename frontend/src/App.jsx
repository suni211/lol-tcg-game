import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CardShop from './pages/CardShop';
import DeckBuilder from './pages/DeckBuilder';
import Battle from './pages/Battle';
import BattleDetail from './pages/BattleDetail';
import Rankings from './pages/Rankings';
import Profile from './pages/Profile';
import Market from './pages/Market';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <ThemeProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="App">
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard token={token} user={user} setUser={setUser} />
              </PrivateRoute>
            }
          />
          <Route
            path="/shop"
            element={
              <PrivateRoute>
                <CardShop token={token} />
              </PrivateRoute>
            }
          />
          <Route
            path="/deck"
            element={
              <PrivateRoute>
                <DeckBuilder token={token} />
              </PrivateRoute>
            }
          />
          <Route
            path="/battle"
            element={
              <PrivateRoute>
                <Battle token={token} />
              </PrivateRoute>
            }
          />
          <Route
            path="/rankings"
            element={
              <PrivateRoute>
                <Rankings token={token} />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile token={token} />
              </PrivateRoute>
            }
          />
          <Route
            path="/market"
            element={
              <PrivateRoute>
                <Market token={token} />
              </PrivateRoute>
            }
          />
          <Route
            path="/battle/:battleId"
            element={
              <PrivateRoute>
                <BattleDetail token={token} />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
