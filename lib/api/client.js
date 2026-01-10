"use client";

/**
 * Frontend API client for Octalve Suite
 * Replaces the localStorage-based base44Client with proper API calls
 */

const API_BASE = '/api';

async function fetchAPI(endpoint, options = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include',
        ...options,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'API Error');
    }

    return res.json();
}

function createEntityAPI(entityPath) {
    return {
        list: (sort) => fetchAPI(`/${entityPath}${sort ? `?sort=${sort}` : ''}`),
        filter: (where) => fetchAPI(`/${entityPath}?${new URLSearchParams(where)}`),
        get: (id) => fetchAPI(`/${entityPath}/${id}`),
        create: (data) => fetchAPI(`/${entityPath}`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => fetchAPI(`/${entityPath}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => fetchAPI(`/${entityPath}/${id}`, {
            method: 'DELETE'
        }),
    };
}

export const api = {
    auth: {
        me: () => fetchAPI('/auth/me'),
        login: (data) => fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        logout: () => fetchAPI('/auth/logout', {
            method: 'POST'
        }),
    },
    projects: createEntityAPI('projects'),
    phases: createEntityAPI('phases'),
    deliverables: createEntityAPI('deliverables'),
    approvals: createEntityAPI('approvals'),
    messages: createEntityAPI('messages'),
    teamMembers: createEntityAPI('team-members'),
    templates: createEntityAPI('templates'),
};

// Backward compatibility alias for existing code that uses base44
export const base44 = {
    auth: api.auth,
    entities: {
        Project: api.projects,
        Phase: api.phases,
        Deliverable: api.deliverables,
        Approval: api.approvals,
        Message: api.messages,
        TeamMember: api.teamMembers,
        Template: api.templates,
    },
};
