'use client'

import {Home as HomeIcon, User} from 'lucide-react'
import {useNav} from '@/context/NavContext'
import {useI18n} from '@/lib/i18n'
import {ErrorBoundary} from '@/components/ErrorBoundary'
import {Home} from '@/screens/Home'
import {AllIssues} from '@/screens/AllIssues'
import {IssueDetail} from '@/screens/IssueDetail'
import {Create} from '@/screens/Create'
import {Profile} from '@/screens/Profile'

const TAB_SCREENS = ['home', 'profile', 'allIssues']

export function App() {
  const {current, tab, setTab, resetTo} = useNav()
  const {t} = useI18n()

  const showTabs = TAB_SCREENS.includes(current.screen)

  const renderScreen = () => {
    switch (current.screen) {
      case 'home':
        return <Home />
      case 'allIssues':
        return <AllIssues />
      case 'issueDetail':
        return <IssueDetail />
      case 'create':
        return <Create />
      case 'profile':
        return <Profile />
      default:
        return <Home />
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <ErrorBoundary
          resetKey={current.screen + JSON.stringify(current.params)}
          onReset={() => {
            setTab('home')
            resetTo('home')
          }}
        >
          <div
            key={current.screen + JSON.stringify(current.params)}
            className="h-full"
          >
            {renderScreen()}
          </div>
        </ErrorBoundary>
      </div>

      {showTabs && (
        <nav className="flex shrink-0 items-stretch border-t border-gray-100 bg-white pb-1">
          <TabButton
            active={tab === 'home'}
            label={t('label_grm')}
            icon={<HomeIcon size={22} />}
            onClick={() => setTab('home')}
          />
          <TabButton
            active={tab === 'profile'}
            label={t('complete_profile').includes('Complete') ? 'Profile' : 'Profil'}
            icon={<User size={22} />}
            onClick={() => setTab('profile')}
          />
        </nav>
      )}
    </div>
  )
}

function TabButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-0.5 py-2.5"
      style={{color: active ? '#24c38b' : '#9ca3af'}}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
