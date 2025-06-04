export interface FieldValidation {
  valid: boolean;
  value: any;
  reason?: string; // Ex: "invalid_format", "blacklisted_value", "empty_input"
}
