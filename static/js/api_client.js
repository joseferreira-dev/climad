/**
 * Este arquivo lida com as chamadas à API e inclui uma função
 * para extrair mensagens de erro específicas das respostas do Django Rest Framework.
 */

/**
 * Analisa a resposta de erro JSON do Django e extrai a primeira mensagem de erro legível.
 * @param {object} errorData - O objeto JSON retornado pelo backend.
 * @returns {string} - A mensagem de erro extraída.
 */
function parseDjangoError(errorData) {
    // Se errorData for um objeto (o caso mais comum, ex: { "field": ["mensagem"] })
    if (typeof errorData === 'object' && errorData !== null) {
        // Pega a primeira chave do objeto (ex: "end_date" ou "parameters")
        const firstKey = Object.keys(errorData)[0];
        if (firstKey && Array.isArray(errorData[firstKey]) && errorData[firstKey].length > 0) {
            // Retorna a primeira mensagem de erro dentro do array
            return errorData[firstKey][0];
        }
    }

    return "Ocorreu um erro de validação nos dados enviados.";
}


async function fetchNasaPowerDaily(params) {
    const apiUrl = new URL('/api/historical/daily/nasa-power/', window.location.origin);
    Object.keys(params).forEach(key => apiUrl.searchParams.append(key, params[key]));

    const response = await fetch(apiUrl);

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = parseDjangoError(errorData);
        throw new Error(errorMessage);
    }
    return response.json();
}

async function fetchNasaPowerHourly(params) {
    const apiUrl = new URL('/api/historical/hourly/nasa-power/', window.location.origin);
    Object.keys(params).forEach(key => apiUrl.searchParams.append(key, params[key]));

    const response = await fetch(apiUrl);

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = parseDjangoError(errorData);
        throw new Error(errorMessage);
    }
    return response.json();
}

async function fetchOpenWeatherRealTime(params) {
    const apiUrl = new URL('/api/real-time/open-weather/', window.location.origin);
    Object.keys(params).forEach(key => apiUrl.searchParams.append(key, params[key]));

    const response = await fetch(apiUrl);

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = parseDjangoError(errorData);
        throw new Error(errorMessage);
    }
    return response.json();
}