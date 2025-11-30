"use client"

import { Home, ShoppingCart, Gift, User } from "lucide-react"
import { useTranslation } from "react-i18next"

interface BottomNavProps {
  activeMenu: string
  setActiveMenu: (menu: string) => void
}

export function BottomNav({ activeMenu, setActiveMenu }: BottomNavProps) {
  const { t } = useTranslation()

  const menuItems = [
    { id: "dashboard", label: t('nav.dashboard'), icon: Home },
    { id: "purchase", label: t('nav.purchase'), icon: ShoppingCart },
    { id: "nodes", label: t('nav.rewards'), icon: Gift },
    { id: "profile", label: t('nav.profile'), icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 safe-area-bottom">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeMenu === item.id

            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 min-w-[70px] ${
                  isActive ? "scale-105" : "hover:bg-gray-100"
                }`}
                style={isActive ? {
                  background: "linear-gradient(135deg, rgba(77, 173, 140, 0.9) 0%, rgba(60, 140, 180, 0.9) 100%)",
                  boxShadow: "0 4px 15px rgba(77, 173, 140, 0.4)"
                } : {}}
              >
                <Icon
                  className={`w-5 h-5 mb-1 transition-colors ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
