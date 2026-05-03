const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1489/api';

export const calculatorsAPI = {
  calcLoan: async ({ amount, rate, term_months }) => {
    const response = await fetch(`${API_BASE_URL}/calculators/loan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, rate, term_months }),
    });
    if (!response.ok) throw new Error('Ошибка расчёта');
    return response.json();
  },
};
