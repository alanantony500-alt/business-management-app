with open('app.js', 'r') as f:
    content = f.read()

# Replace the native validation with manual toast validation
old_validation = """    if (!recordForm.checkValidity()) {
        recordForm.reportValidity();
        return;
    }"""

new_validation = """    // Manual Validation
    if (!customerName.value.trim() || !amountInput.value || !staffCommissionInput.value || !staffNameInput.value || !serviceDate.value || !serviceTime.value) {
        showToast('Please fill out all required fields (Name, Amount, Commission, Staff Name, Date, Time)', 'error');
        return;
    }"""

content = content.replace(old_validation, new_validation)

with open('app.js', 'w') as f:
    f.write(content)
