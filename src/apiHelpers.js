import api from './api';

/**
 * Fetches all results from a paginated API endpoint.
 * @param {string} initialUrl - The initial URL of the paginated resource.
 * @returns {Promise<Array>} A promise that resolves to an array of all results.
 */
export const fetchAllPaginatedResults = async (initialUrl) => {
    let results = [];
    let nextUrl = initialUrl;

    while (nextUrl) {
        const { data } = await api.get(nextUrl);
        results = results.concat(data.results || []);
        // The API provides relative URLs for 'next', so we can use them directly.
        nextUrl = data.next;
    }

    return results;
};