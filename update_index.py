with open('index.html', 'r') as f:
    content = f.read()

content = content.replace('<section id="login-screen" class="screen active">', '<section id="login-screen" class="screen" style="display: none;">')
content = content.replace('<section id="dashboard-screen" class="screen">', '<section id="dashboard-screen" class="screen active">')
content = content.replace('<button id="logout-btn" class="btn btn-icon" title="Logout">', '<button id="logout-btn" class="btn btn-icon" title="Logout" style="display: none;">')

with open('index.html', 'w') as f:
    f.write(content)
