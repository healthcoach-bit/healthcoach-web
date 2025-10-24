# Form Components Documentation

## Overview
Reusable form components with consistent styling and better text visibility.

---

## Components

### FormInput
Text input component with label, error handling, and helper text.

#### Props
```typescript
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;          // Optional label text
  error?: string;          // Error message to display
  helperText?: string;     // Helper text below input
  className?: string;      // Additional CSS classes
}
```

#### Features
- **Dark text color** (`text-gray-900`) for better visibility
- **Gray placeholders** (`placeholder:text-gray-400`) that are readable but subtle
- **Green focus ring** for accessibility
- **Error state** with red border and message
- **Disabled state** with gray background

#### Usage
```tsx
import FormInput from '@/components/FormInput';

// Basic usage
<FormInput
  type="text"
  label="Name"
  placeholder="Enter your name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// With error
<FormInput
  type="email"
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
/>

// With helper text
<FormInput
  type="password"
  label="Password"
  helperText="Must be at least 8 characters"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

---

### FormSelect
Select dropdown component with label, error handling, and helper text.

#### Props
```typescript
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;                                   // Optional label text
  error?: string;                                   // Error message to display
  helperText?: string;                              // Helper text below select
  options?: { value: string; label: string }[];     // Array of options
  className?: string;                               // Additional CSS classes
}
```

#### Features
- **Dark text color** for selected options
- **White background** to distinguish from inputs
- **Green focus ring** for accessibility
- **Error state** with red border and message
- **Disabled state** with gray background

#### Usage
```tsx
import FormSelect from '@/components/FormSelect';

// With children
<FormSelect
  label="Gender"
  value={gender}
  onChange={(e) => setGender(e.target.value)}
>
  <option value="">Select...</option>
  <option value="male">Male</option>
  <option value="female">Female</option>
</FormSelect>

// With options array
<FormSelect
  label="Country"
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  options={[
    { value: '', label: 'Select...' },
    { value: 'us', label: 'United States' },
    { value: 'mx', label: 'Mexico' },
  ]}
/>

// With error
<FormSelect
  label="Category"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  error={categoryError}
>
  <option value="">Select...</option>
  <option value="A">Category A</option>
</FormSelect>
```

---

### FormTextarea
Textarea component with label, error handling, and helper text.

#### Props
```typescript
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;          // Optional label text
  error?: string;          // Error message to display
  helperText?: string;     // Helper text below textarea
  className?: string;      // Additional CSS classes
}
```

#### Features
- **Dark text color** (`text-gray-900`) for better visibility
- **Gray placeholders** (`placeholder:text-gray-400`) that are readable but subtle
- **Auto-resize disabled** (`resize-none`) for consistent layout
- **Green focus ring** for accessibility
- **Error state** with red border and message
- **Disabled state** with gray background

#### Usage
```tsx
import FormTextarea from '@/components/FormTextarea';

// Basic usage
<FormTextarea
  label="Notes"
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  rows={4}
  placeholder="Add your notes here..."
/>

// With helper text
<FormTextarea
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  helperText="Describe what you ate, portion sizes, or any other details"
  rows={4}
/>
```

---

## Design Tokens

### Colors
- **Text input**: `text-gray-900` (very dark, high contrast)
- **Placeholder**: `placeholder:text-gray-400` (medium gray, readable)
- **Label**: `text-gray-700` (dark gray)
- **Border**: `border-gray-300` (light gray)
- **Border (error)**: `border-red-500` (red)
- **Focus ring**: `ring-green-500` (brand green)
- **Error text**: `text-red-600` (red)
- **Helper text**: `text-gray-500` (medium gray)

### Spacing
- **Input padding**: `px-4 py-2`
- **Label margin**: `mb-2`
- **Helper/Error margin**: `mt-1`

---

## Migration Guide

### Before (old style)
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Email
  </label>
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
    placeholder="email@example.com"
  />
</div>
```

### After (new components)
```tsx
<FormInput
  type="email"
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="email@example.com"
/>
```

---

## Benefits

1. **Consistent styling** across all forms
2. **Better visibility** - dark text, readable placeholders
3. **Less code** - no need to repeat className strings
4. **Error handling** built-in
5. **Accessibility** - proper labels and ARIA attributes
6. **Easy to maintain** - change once, applies everywhere

---

## Pages Using These Components

### ✅ Fully Migrated
All forms in the application now use these components for consistency:

#### Auth Pages
- `/login` - Login form (email, password)
- `/signup` - Signup form (email, password, verification code)

#### Dashboard Pages
- `/dashboard/new-log` - Create food log form (datetime, notes textarea)
- `/dashboard/health-profile` - Health profile form (all inputs and selects)

### Complete Form Coverage

| Page | Components Used | Count |
|------|----------------|-------|
| `/login` | FormInput | 2 |
| `/signup` | FormInput | 3 |
| `/dashboard/new-log` | FormInput, FormTextarea | 2 |
| `/dashboard/health-profile` | FormInput, FormSelect | 11 |

**Total:** 100% of forms migrated ✅

---

## Quick Reference

### Import Statement
```tsx
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import FormTextarea from '@/components/FormTextarea';
```

### Common Patterns

#### Text Input
```tsx
<FormInput
  label="Field Name"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

#### Email Input
```tsx
<FormInput
  type="email"
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="you@example.com"
  required
/>
```

#### Password Input
```tsx
<FormInput
  type="password"
  label="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  helperText="Must be at least 8 characters"
  required
/>
```

#### Number Input
```tsx
<FormInput
  type="number"
  step="0.1"
  label="Weight (kg)"
  value={weight}
  onChange={(e) => setWeight(e.target.value)}
  placeholder="70.5"
/>
```

#### Select Dropdown
```tsx
<FormSelect
  label="Gender"
  value={gender}
  onChange={(e) => setGender(e.target.value)}
>
  <option value="">Select...</option>
  <option value="male">Male</option>
  <option value="female">Female</option>
</FormSelect>
```

#### Textarea
```tsx
<FormTextarea
  label="Notes"
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  rows={4}
  placeholder="Add notes..."
  helperText="Optional field"
/>
```
