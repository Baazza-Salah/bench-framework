import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import SolutionEntry from './pages/SolutionEntry';
import CriteriaInput from './pages/CriteriaInput';
import Comparison from './pages/Comparison';
import Battle from './pages/Battle';
import CriteriaBuilder from './pages/CriteriaBuilder';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Logs from './pages/Logs';
import './index.css';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null; // Wait for initial auth check
    return user ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <DataProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            
                            <Route path="/*" element={
                                <PrivateRoute>
                                    <Layout>
                                        <Routes>
                                            <Route path="/" element={<Dashboard />} />
                                            <Route path="/solution/:id?" element={<SolutionEntry />} />
                                            <Route path="/assess/:id" element={<CriteriaInput />} />
                                            <Route path="/compare" element={<Comparison />} />
                                            <Route path="/battle" element={<Battle />} />
                                            <Route path="/logs" element={<Logs />} />
                                            <Route path="/criteria" element={<CriteriaBuilder />} />
                                            <Route path="/about" element={<About />} />
                                        </Routes>
                                    </Layout>
                                </PrivateRoute>
                            } />
                        </Routes>
                    </Router>
                </DataProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
