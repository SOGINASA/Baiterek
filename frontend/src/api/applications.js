const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1489/api';

export const applicationsAPI = {
  getAll: async (token) => {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Ошибка загрузки заявок');
    return response.json();
  },

  getById: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Заявка не найдена');
    return response.json();
  },

  create: async (serviceId, formData, token) => {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ service_id: serviceId, form_data: formData }),
    });
    if (!response.ok) throw new Error('Ошибка создания заявки');
    return response.json();
  },

  update: async (id, formData, status, token) => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ form_data: formData, status }),
    });
    if (!response.ok) throw new Error('Ошибка обновления заявки');
    return response.json();
  },

  submit: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Ошибка отправки заявки');
    return response.json();
  },

  // Notifications
  getNotifications: async (token) => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Ошибка загрузки уведомлений');
    return response.json();
  },

  markNotificationRead: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Ошибка обновления уведомления');
    return response.json();
  },
};
