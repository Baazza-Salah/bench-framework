import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const DataContext = createContext();

const API_BASE = '/api';

export const DataProvider = ({ children }) => {
    const [solutions, setSolutions] = useState([]);
    const [criteria, setCriteria] = useState([]);
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [solRes, critRes] = await Promise.all([
                axios.get(`${API_BASE}/solutions`),
                axios.get(`${API_BASE}/criteria`)
            ]);
            setSolutions(solRes.data);
            setCriteria(critRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    const addSolution = async (solution) => {
        const res = await axios.post(`${API_BASE}/solutions`, solution);
        setSolutions([...solutions, res.data]);
    };

    const deleteSolution = async (id) => {
        await axios.delete(`${API_BASE}/solutions/${id}`);
        setSolutions(solutions.filter(s => s.id !== id));
    };

    return (
        <DataContext.Provider value={{ solutions, criteria, loading, addSolution, deleteSolution, fetchData }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
