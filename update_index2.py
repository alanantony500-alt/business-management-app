import re
with open('index.html', 'r') as f:
    content = f.read()

# Remove login screen completely
content = re.sub(r'<div id="login-screen".*?</div>\s*</div>\s*</div>', '', content, flags=re.DOTALL)

# Make dashboard active
content = re.sub(r'<div id="dashboard-screen" class="screen app-wrapper">', '<div id="dashboard-screen" class="screen app-wrapper active">', content)

# Remove logout button completely
content = re.sub(r'<button id="logout-btn" class="btn btn-icon" title="Logout">.*?</button>', '', content, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(content)
