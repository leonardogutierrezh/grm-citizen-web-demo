// Mirrors src/utils/colors.js from the native app.
export const colors = {
  primary: '#24c38b',
  tertiary: '#458d74',
  primary200: '#e1f2eb',
  darkGrey: '#4A4A4A',
  disabled: '#eeeeee',
  disabled200: '#dbe3e1',
  inProgress: '#f5ba74',
  lightgray: '#dedede',
  error: '#ef6a78',
  secondary: '#707070',
  white: '#ffffff',
}

export type StatusInfo = {color: string; textColor: string; key: string}

export function getStatusInfo(status?: {name?: string} | null): StatusInfo {
  const map: Record<string, StatusInfo> = {
    submitted: {color: '#dee9fc', textColor: '#314aad', key: 'submitted'},
    in_progress: {color: '#fdf9c9', textColor: '#875d2c', key: 'in_progress'},
    resolved: {color: '#e2fbe8', textColor: '#4ca055', key: 'resolved'},
  }
  const name = status?.name?.toLowerCase().replace(/\s+/g, '_') || 'submitted'
  return map[name] || map['submitted']
}

export function getCategoryInfo(category?: string) {
  const map: Record<string, {icon: string; color: string; textColor: string}> = {
    grievance: {icon: 'alert-octagon', color: '#f9e3e2', textColor: '#ca3a31'},
    feedback: {icon: 'message-circle', color: '#dee9fc', textColor: '#3662e2'},
    question: {icon: 'help-circle', color: '#e2fbe8', textColor: '#4ca055'},
  }
  return map[category?.toLowerCase() || ''] || map['grievance']
}
