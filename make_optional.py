with open('index.html', 'r') as f:
    content = f.read()

# Replace required with nothing for specific optional fields
fields_to_make_optional = [
    'id="phone-number"',
    'id="nationality"',
    'id="room-number"',
    'id="service-timing"',
    'id="body-size"',
    'id="behavior"'
]

for field in fields_to_make_optional:
    # Find the line containing this field
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if field in line and 'required' in line:
            lines[i] = line.replace('required', '')
    content = '\n'.join(lines)

with open('index.html', 'w') as f:
    f.write(content)
