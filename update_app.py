with open('app.js', 'r') as f:
    content = f.read()

content = content.replace("const loginScreen = document.getElementById('login-screen');", "// loginScreen removed")
content = content.replace("const loginForm = document.getElementById('login-form');", "// loginForm removed")
content = content.replace("const usernameInput = document.getElementById('username');", "")
content = content.replace("const passwordInput = document.getElementById('password');", "")
content = content.replace("const loginError = document.getElementById('login-error');", "")
content = content.replace("const logoutBtn = document.getElementById('logout-btn');", "")

# Remove the whole checkAuth logic
check_auth_start = content.find("let isAuthenticated = false;")
check_auth_end = content.find("// Fetch Data from Supabase")

if check_auth_start != -1 and check_auth_end != -1:
    new_auth_logic = """
// Initial Setup
async function initApp() {
    document.getElementById('dashboard-screen').classList.add('active');
    
    // Hide login screen safely if it exists in DOM
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.classList.remove('active');
    
    await fetchRecords();
    try { lucide.createIcons(); } catch (e) { console.warn("Lucide load failed"); }
}

"""
    content = content[:check_auth_start] + new_auth_logic + content[check_auth_end:]

with open('app.js', 'w') as f:
    f.write(content)
