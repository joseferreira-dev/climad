/**
 * Este arquivo lida com as chamadas à API e inclui uma função
 * para extrair mensagens de erro específicas, seja do CAPTCHA ou dos validadores do Django.
 */

/**
 * Analisa a resposta de erro JSON do Django e extrai a primeira mensagem de erro legível.
 * Agora é capaz de entender tanto erros de campo quanto erros genéricos (como o do CAPTCHA).
 * @param {object} errorData - O objeto JSON retornado pelo backend.
 * @returns {string} - A mensagem de erro extraída.
 */
function parseDjangoError(errorData) {
    // Se errorData for um objeto (o caso mais comum)
    if (typeof errorData === 'object' && errorData !== null) {
        // Primeiro, verifica se existe uma chave "error" direta (como no erro do CAPTCHA)
        if (errorData.error) {
            return errorData.error;
        }

        // Se não houver, continua com a lógica para erros de validação de campo
        const firstKey = Object.keys(errorData)[0];
        if (firstKey && Array.isArray(errorData[firstKey]) && errorData[firstKey].length > 0) {
            return errorData[firstKey][0];
        }
    }
    // Se o formato for totalmente inesperado, retorna uma mensagem genérica.
    return "Ocorreu um erro desconhecido na validação dos dados.";
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