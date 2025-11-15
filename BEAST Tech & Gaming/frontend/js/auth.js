const API_BASE = 'http://localhost:3000/api';

// Check authentication status
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user) {
        if (window.location.pathname.includes('profile.html') || 
            window.location.pathname.includes('checkout.html')) {
            window.location.href = 'login.html';
        }
    }
    
    return { token, user };
}

// Login function
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        return { success: false, message: 'Network error occurred' };
    }
}

// Signup function
async function signup(userData) {
    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        return { success: false, message: 'Network error occurred' };
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Protected API call
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        logout();
        throw new Error('Authentication required');
    }
    
    return response;
}

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const result = await login(email, password);
            
            if (result.success) {
                // Redirect to previous page or home
                const redirectTo = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
                window.location.href = redirectTo;
            } else {
                alert(result.message);
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});