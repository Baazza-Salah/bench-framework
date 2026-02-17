import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import SolutionEntry from './pages/SolutionEntry';
import CriteriaInput from './pages/CriteriaInput';
import Comparison from './pages/Comparison';
import Battle from './pages/Battle';
import CriteriaBuilder from './pages/CriteriaBuilder';
import './index.css';

function App() {
    return (
        <ThemeProvider>
            <DataProvider>
                <Router>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/solution/:id?" element={<SolutionEntry />} />
                            <Route path="/assess/:id" element={<CriteriaInput />} />
                            <Route path="/compare" element={<Comparison />} />
                            <Route path="/battle" element={<Battle />} />
                            <Route path="/criteria" element={<CriteriaBuilder />} />
                        </Routes>
                    </Layout>
                </Router>
            </DataProvider>
        </ThemeProvider>
    );
}

export default App;
