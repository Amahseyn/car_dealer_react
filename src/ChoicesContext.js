import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './api';

const ChoicesContext = createContext(null);

export const ChoicesProvider = ({ children }) => {
    const [choices, setChoices] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChoices = async () => {
            try {
                const { data } = await api.get('/listings/choices/');
                setChoices(data);
            } catch (err) {
                console.error("Failed to fetch form choices", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchChoices();
    }, []);

    const value = { choices, loading, error };

    return <ChoicesContext.Provider value={value}>{!loading && children}</ChoicesContext.Provider>;
};

export const useChoices = () => {
    return useContext(ChoicesContext);
};