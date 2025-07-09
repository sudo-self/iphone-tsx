"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Battery,
  Signal,
  Wifi,
  Lock,
  ChevronRight,
  ChevronLeft,
  Phone,
  Calendar,
  Calculator,
  User,
  Search,
  Mic,
  Camera,
  Globe,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getContacts } from "@/lib/redis"
import { saveEvent, getEvents } from "@/lib/redis"
import { type PhoneSettings, defaultSettings, loadSettings, saveSettings } from "@/lib/settings"

export default function SmartphoneUI() {
  const [isLocked, setIsLocked] = useState(true)
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [activeApp, setActiveApp] = useState<string | null>(null)
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [contacts, setContacts] = useState<Array<{ name: string; phone: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<PhoneSettings>(defaultSettings)

useEffect(() => {
  const updateTime = () => {
    const now = new Date()
    setCurrentTime(
      now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    )
    setCurrentDate(
      now.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    )
  }

  updateTime()
  const interval = setInterval(updateTime, 60000)

  return () => clearInterval(interval)
}, [])



  useEffect(() => {
    const loadedSettings = loadSettings()
    setSettings(loadedSettings)
  }, [])


  useEffect(() => {
    const fetchContacts = async () => {
      if (!isLocked) {
        setIsLoading(true)
        try {
          const contactsList = await getContacts()
          setContacts(contactsList)
        } catch (error) {
          console.error("Failed to fetch contacts:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchContacts()
  }, [isLocked, activeApp])

  const handleUnlock = () => {
    setIsLocked(false)
  }

  const handleLock = () => {
    setIsLocked(true)
    setActiveApp(null)
  }

  const openApp = (appName: string) => {
    setActiveApp(appName)
  }

  const goHome = () => {
    setActiveApp(null)
  }

  const refreshContacts = async () => {
    setIsLoading(true)
    try {
      const contactsList = await getContacts()
      setContacts(contactsList)
    } catch (error) {
      console.error("Failed to refresh contacts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = (newSettings: PhoneSettings) => {
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const getHomeButtonStyle = () => {
    switch (settings.homeButtonStyle) {
      case "square":
        return "w-12 h-12 rounded-lg border-2 border-white/50"
      case "pill":
        return "w-16 h-8 rounded-full border-2 border-white/50"
      default:
        return "w-12 h-12 rounded-full border-2 border-white/50"
    }
  }

  const getAppIconStyle = () => {
    switch (settings.appIconStyle) {
      case "square":
        return "w-14 h-14 rounded-lg"
      case "circle":
        return "w-14 h-14 rounded-full"
      default:
        return "w-14 h-14 rounded-2xl"
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 p-4">
      <div className="relative w-full max-w-[375px] h-[750px] bg-black rounded-[40px] overflow-hidden shadow-2xl border-[14px] border-black">
      
        <div className="absolute right-[-14px] top-[120px] w-[4px] h-[40px] bg-gray-700 rounded-r-sm"></div>
     
        <div className="absolute left-[-14px] top-[100px] w-[4px] h-[30px] bg-gray-700 rounded-l-sm"></div>
        <div className="absolute left-[-14px] top-[140px] w-[4px] h-[30px] bg-gray-700 rounded-l-sm"></div>

        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-[14px] z-50"></div>

        <div className="relative w-full h-full bg-gray-900 overflow-hidden">
          {/* Status Bar - Always visible */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-12 px-6 flex justify-between items-center z-40",
              settings.statusBarStyle === "dark" ? "text-gray-800" : "text-gray-200",
            )}
          >
            {/* Left side: device name and time */}
            <div className="flex flex-col text-left text-sm font-medium leading-tight">
              <span>{settings.deviceName}</span>
              <span className="text-xs">{currentTime}</span>
            </div>

            {/* Right side: icons and battery */}
            <div className="flex items-center gap-2">
              <Signal className="w-4 h-4" />
              <Wifi className="w-4 h-4" />
              <div className="flex items-center">
                {settings.batteryPercentage && <span className="text-xs mr-1 text-green-700">{batteryLevel}%</span>}
                <Battery className="w-5 h-5" />
              </div>
            </div>
          </div>

          {isLocked ? (
            // Lock
            <div
              className="absolute inset-0 flex flex-col items-center bg-cover bg-center"
              style={{ backgroundImage: `url('${settings.lockScreenWallpaper}')` }}
            >
              <div className="mt-20 text-white text-center">
                <div className="text-6xl font-light">{currentTime}</div>
                <div className="mt-2 text-lg">{currentDate}</div>
              </div>

              <div className="mt-auto mb-10 flex flex-col items-center">
                <div className="p-4 rounded-full mb-4">
                  <Lock className="w-6 h-6 text-white" />
                </div>
               <button onClick={handleUnlock} className="text-white text-lg font-light flex items-center">
  <ChevronLeft className="w-5 h-5 mr-1 animate-pulse" />
  Tap to Unlock
  <ChevronRight className="w-5 h-5 ml-1 animate-pulse" />
</button>


              </div>
            </div>
          ) : (
        
            <div className="absolute inset-0 pt-12">
              {activeApp ? (
            
                <div className="h-full">
            
                  <div className="h-12 flex items-center justify-between px-4 bg-gray-800">
                    <h2 className="text-white text-lg font-medium">{activeApp}</h2>
                    {(activeApp === "Contacts" || activeApp === "Phone") && (
                      <button onClick={refreshContacts} className="text-blue-400 text-sm" disabled={isLoading}>
                        {isLoading ? "Loading..." : "Refresh"}
                      </button>
                    )}
                  </div>

              
                  {activeApp === "Phone" && <PhoneApp contacts={contacts} />}
                  {activeApp === "Contacts" && <ContactsApp contacts={contacts} onContactsChange={refreshContacts} />}
                  {activeApp === "Calendar" && <CalendarApp />}
                  {activeApp === "Calculator" && <CalculatorApp />}
                  {activeApp === "Camera" && <CameraApp />}
                  {activeApp === "Browser" && <BrowserApp />}
                  {activeApp === "Settings" && <SettingsApp settings={settings} onSettingsChange={updateSettings} />}
                </div>
              ) : (
          
                <div
                  className="h-full flex flex-col bg-cover bg-center"
                  style={{ backgroundImage: `url('${settings.wallpaper}')` }}
                >
                  <div className="flex-1 grid grid-cols-4 gap-4 p-6 mt-8">
                    <AppIcon
                      name="Phone"
                      icon={<Phone />}
                      onClick={() => openApp("Phone")}
                      iconStyle={getAppIconStyle()}
                    />
                    <AppIcon
                      name="Contacts"
                      icon={<User />}
                      onClick={() => openApp("Contacts")}
                      iconStyle={getAppIconStyle()}
                    />
                    <AppIcon
                      name="Calendar"
                      icon={<Calendar />}
                      onClick={() => openApp("Calendar")}
                      iconStyle={getAppIconStyle()}
                    />
                    <AppIcon
                      name="Calculator"
                      icon={<Calculator />}
                      onClick={() => openApp("Calculator")}
                      iconStyle={getAppIconStyle()}
                    />
                    <AppIcon
                      name="Camera"
                      icon={<Camera />}
                      onClick={() => openApp("Camera")}
                      iconStyle={getAppIconStyle()}
                    />
                    <AppIcon
                      name="Browser"
                      icon={<Globe />}
                      onClick={() => openApp("Browser")}
                      iconStyle={getAppIconStyle()}
                    />
                    <AppIcon
                      name="Settings"
                      icon={<Settings />}
                      onClick={() => openApp("Settings")}
                      iconStyle={getAppIconStyle()}
                    />
                  </div>
                </div>
              )}

       
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-16 backdrop-blur-md flex justify-center items-center",
                  `bg-${settings.taskbarColor}`,
                )}
              >
                <button onClick={activeApp ? goHome : handleLock} className={getHomeButtonStyle()}></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// icon
function AppIcon({
  name,
  icon,
  onClick,
  iconStyle,
}: { name: string; icon: React.ReactNode; onClick: () => void; iconStyle: string }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center">
      <div
        className={cn(
          iconStyle,
          "bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white mb-1",
        )}
      >
        {icon}
      </div>
      <span className="text-xs text-white">{name}</span>
    </button>
  )
}


function SettingsApp({
  settings,
  onSettingsChange,
}: { settings: PhoneSettings; onSettingsChange: (settings: PhoneSettings) => void }) {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const settingSections = [
    { id: "display", name: "Display & Brightness", icon: "🌟" },
    { id: "wallpaper", name: "Wallpaper", icon: "🖼️" },
    { id: "general", name: "General", icon: "⚙️" },
    { id: "about", name: "About", icon: "ℹ️" },
  ]

  const wallpaperOptions = [
    {
      name: "iphone 16",
      url: "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/wallpaper_iphone.png?alt=media&token=f87e9198-2f22-4f65-89fd-f599a5ddcd34",
    },
    {
      name: "Abstract Purple",
      url: "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/apple-ios-wallpapers.jpg?alt=media&token=d9e65040-0131-4fa7-8224-5293b1e126e0",
    },
    {
      name: "iOS Gradient",
      url: "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/lockscreen.jpg?alt=media&token=406ef44d-c8f3-4796-99ad-8feee27352da",
    },
    {
      name: "iPad Blue",
      url: "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/ipad_wallpaper.png?alt=media&token=cb015e53-1df5-4474-96bf-789e39c6cffa",
    },
  ]

  const taskbarColorOptions = [
    { name: "Default", value: "black/30" },
    { name: "Dark", value: "black/60" },
    { name: "Blue", value: "blue-900/40" },
    { name: "Purple", value: "purple-900/40" },
    { name: "Green", value: "green-900/40" },
    { name: "Red", value: "red-900/40" },
  ]

  if (activeSection === "wallpaper") {
    return (
      <div className="h-full bg-gray-900 text-white flex flex-col overflow-hidden">
        <div className="flex items-center mb-6 px-4 pt-4 flex-shrink-0">
          <button onClick={() => setActiveSection(null)} className="text-blue-400 mr-4">
            ← Back
          </button>
          <h2 className="text-xl font-bold">Wallpaper</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Home Screen</h3>
            <div className="grid grid-cols-2 gap-3">
              {wallpaperOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => onSettingsChange({ ...settings, wallpaper: option.url })}
                  className={cn(
                    "relative aspect-[3/4] rounded-lg overflow-hidden border-2",
                    settings.wallpaper === option.url ? "border-blue-500" : "border-gray-600",
                  )}
                >
                  <img
                    src={option.url || "/placeholder.svg"}
                    alt={option.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                    <span className="text-xs text-white">{option.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Lock Screen</h3>
            <div className="grid grid-cols-2 gap-3">
              {wallpaperOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => onSettingsChange({ ...settings, lockScreenWallpaper: option.url })}
                  className={cn(
                    "relative aspect-[3/4] rounded-lg overflow-hidden border-2",
                    settings.lockScreenWallpaper === option.url ? "border-blue-500" : "border-gray-600",
                  )}
                >
                  <img
                    src={option.url || "/placeholder.svg"}
                    alt={option.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                    <span className="text-xs text-white">{option.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activeSection === "display") {
    return (
      <div className="h-full bg-gray-900 text-white flex flex-col overflow-hidden">
        <div className="flex items-center mb-6 px-4 pt-4 flex-shrink-0">
          <button onClick={() => setActiveSection(null)} className="text-blue-400 mr-4">
            ← Back
          </button>
          <h2 className="text-xl font-bold">Display & Brightness</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Taskbar Color</h3>
              <div className="grid grid-cols-2 gap-2">
                {taskbarColorOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => onSettingsChange({ ...settings, taskbarColor: option.value })}
                    className={cn(
                      "p-3 rounded-lg border-2 text-left",
                      settings.taskbarColor === option.value
                        ? "border-blue-500 bg-blue-900/20"
                        : "border-gray-600 bg-gray-800",
                    )}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Home Button Style</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Circle", value: "circle" as const },
                  { name: "Square", value: "square" as const },
                  { name: "Pill", value: "pill" as const },
                ].map((option, index) => (
                  <button
                    key={index}
                    onClick={() => onSettingsChange({ ...settings, homeButtonStyle: option.value })}
                    className={cn(
                      "p-3 rounded-lg border-2 text-center",
                      settings.homeButtonStyle === option.value
                        ? "border-blue-500 bg-blue-900/20"
                        : "border-gray-600 bg-gray-800",
                    )}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">App Icon Style</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Rounded", value: "rounded" as const },
                  { name: "Square", value: "square" as const },
                  { name: "Circle", value: "circle" as const },
                ].map((option, index) => (
                  <button
                    key={index}
                    onClick={() => onSettingsChange({ ...settings, appIconStyle: option.value })}
                    className={cn(
                      "p-3 rounded-lg border-2 text-center",
                      settings.appIconStyle === option.value
                        ? "border-blue-500 bg-blue-900/20"
                        : "border-gray-600 bg-gray-800",
                    )}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Status Bar</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span>Show Battery Percentage</span>
                  <button
                    onClick={() => onSettingsChange({ ...settings, batteryPercentage: !settings.batteryPercentage })}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      settings.batteryPercentage ? "bg-blue-600" : "bg-gray-600",
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                        settings.batteryPercentage ? "translate-x-6" : "translate-x-0.5",
                      )}
                    />
                  </button>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activeSection === "general") {
    return (
      <div className="h-full bg-gray-900 text-white flex flex-col overflow-hidden">
        <div className="flex items-center mb-6 px-4 pt-4">
          <button onClick={() => setActiveSection(null)} className="text-blue-400 mr-4">
            ← Back
          </button>
          <h2 className="text-xl font-bold">General</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Device Name</h3>
              <input
                type="text"
                value={settings.deviceName}
                onChange={(e) => onSettingsChange({ ...settings, deviceName: e.target.value })}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                placeholder="Enter device name"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Reset Settings</h3>
              <button
                onClick={() => {
                  const defaultSettings = {
                    wallpaper:
                      "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/wallpaper_iphone.png?alt=media&token=f87e9198-2f22-4f65-89fd-f599a5ddcd34",
                    lockScreenWallpaper:
                      "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/apple-ios-wallpapers.jpg?alt=media&token=d9e65040-0131-4fa7-8224-5293b1e126e0",
                    taskbarColor: "black/30",
                    homeButtonStyle: "circle" as const,
                    statusBarStyle: "light" as const,
                    appIconStyle: "rounded" as const,
                    deviceName: "iPhone TSX",
                    batteryPercentage: true,
                  }
                  onSettingsChange(defaultSettings)
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activeSection === "about") {
    return (
      <div className="h-full bg-gray-900 text-white flex flex-col overflow-hidden">
        <div className="flex items-center mb-6 px-4 pt-4">
          <button onClick={() => setActiveSection(null)} className="text-blue-400 mr-4">
            ← Back
          </button>
          <h2 className="text-xl font-bold">About</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-4">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold">{settings.deviceName}</h3>
              <p className="text-gray-400">JesseJesse.com</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Version</span>
                <span>2.0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Model</span>
                <span>iPhone TSX</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Storage</span>
                <span>Supabase</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Battery Health</span>
                <span className="text-green-500">Excellent</span>
              </div>
            </div>

            <div className="mt-8 text-center text-gray-400 text-sm">
              <p>Next.js 15.4</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {settingSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{section.icon}</span>
                <span className="text-lg">{section.name}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>iphone-tsx.vercel.app</p>
        </div>
      </div>
    </div>
  )
}

// Phone App
function PhoneApp({ contacts }: { contacts: Array<{ name: string; phone: string }> }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredContacts = contacts.filter(
    (contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || contact.phone.includes(searchTerm),
  )

  return (
    <div className="h-full bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 mb-4">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search contacts"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none flex-1 text-white"
        />
        <Mic className="w-5 h-5 text-gray-400 ml-2" />
      </div>

      {contacts.length === 0 ? (
        <div className="text-center text-gray-400 mt-8">
          <p>No contacts found</p>
          <p className="text-sm mt-2">Add contacts in the Contacts app</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredContacts.map((contact, index) => (
            <div key={index} className="flex items-center p-3 border-b border-gray-800">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                {contact.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium hover:text-green-600">{contact.name}</div>
                <a href={`tel:${String(contact.phone || "").replace(/[^+\d]/g, "")}`}>{contact.phone}</a>
              </div>
              <Phone className="w-5 h-5 ml-auto text-green-500" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Contacts App
function ContactsApp({
  contacts,
  onContactsChange,
}: {
  contacts: Array<{ name: string; phone: string }>
  onContactsChange: () => Promise<void>
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredContacts = contacts.filter(
    (contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || contact.phone.includes(searchTerm),
  )

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newPhone) return

    setIsSubmitting(true)
    try {
      const { addContact } = await import("@/lib/redis")
      await addContact(newName, newPhone)
      setNewName("")
      setNewPhone("")
      setShowAddForm(false)
      await onContactsChange()
    } catch (error) {
      console.error("Failed to add contact:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteContact = async (name: string) => {
    try {
      const { deleteContact } = await import("@/lib/redis")
      await deleteContact(name)
      await onContactsChange()
    } catch (error) {
      console.error("Failed to delete contact:", error)
    }
  }

  return (
    <div className="h-full bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 flex-1 mr-2">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search contacts"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-white"
          />
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white p-2 rounded-full">
          {showAddForm ? "×" : "+"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddContact} className="bg-gray-800 p-4 rounded-lg mb-4">
          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
              placeholder="Contact name"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-1">Phone</label>
            <input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Contact"}
          </button>
        </form>
      )}

      {contacts.length === 0 ? (
        <div className="text-center text-gray-400 mt-8">
          <p>No contacts found</p>
          <p className="text-sm mt-2">Add a new contact with the + button</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredContacts.map((contact, index) => (
            <div key={index} className="flex items-center p-3 border-b border-gray-800">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                {contact.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{contact.name}</div>
                <div className="text-sm text-gray-400">{contact.phone}</div>
              </div>
              <button onClick={() => handleDeleteContact(contact.name)} className="text-red-500 p-2">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Calendar App
function CalendarApp() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState("")
  const [newEvent, setNewEvent] = useState("")
  const [events, setEvents] = useState<Record<string, string>>({})

  const currentDay = today.getDate()
  const currentMonth = viewDate.toLocaleString("default", { month: "long" })
  const currentYear = viewDate.getFullYear()

  const daysInMonth = new Date(currentYear, viewDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, viewDate.getMonth(), 1).getDay()

  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDayOfMonth + 1
    return day > 0 && day <= daysInMonth ? day : null
  })

  useEffect(() => {
    const load = async () => {
      const stored = await getEvents()
      setEvents(stored)
    }
    load()
  }, [])

  const handleAddEvent = async () => {
    if (!selectedDate || !newEvent) return
    await saveEvent(selectedDate, newEvent)
    setEvents((prev) => ({ ...prev, [selectedDate]: newEvent }))
    setNewEvent("")
  }

  return (
 <div className="h-full overflow-y-auto flex flex-col bg-gray-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setViewDate(new Date(currentYear, viewDate.getMonth() - 1, 1))}>←</button>
        <h2 className="text-xl font-bold">
          {currentMonth} {currentYear}
        </h2>
        <button onClick={() => setViewDate(new Date(currentYear, viewDate.getMonth() + 1, 1))}>→</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-sm text-gray-400">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dateStr = day
            ? `${currentYear}-${String(viewDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : ""

          return (
            <div
              key={index}
              onClick={() => day && setSelectedDate(dateStr)}
              className={cn(
                "h-10 flex items-center justify-center rounded-full text-sm cursor-pointer",
                dateStr === selectedDate
                  ? "bg-blue-600"
                  : day === currentDay &&
                      viewDate.getMonth() === today.getMonth() &&
                      viewDate.getFullYear() === today.getFullYear()
                    ? "bg-white text-black"
                    : day
                      ? "hover:bg-gray-800"
                      : "text-gray-700",
              )}
            >
              {day}
            </div>
          )
        })}
      </div>

      {selectedDate && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Add Event for {selectedDate}</h3>
          <input
            type="text"
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            placeholder="Event description..."
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 mb-2"
          />
          <button onClick={handleAddEvent} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            Save
          </button>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Calendar Events</h3>
        <div className="space-y-3">
          {Object.entries(events).map(([date, event]) => (
            <div key={date} className="p-3 bg-gray-800 rounded-lg">
              <div className="text-sm text-blue-400">{date}</div>
              <div className="font-medium">{event}</div>
            </div>
          ))}
          {Object.keys(events).length === 0 && <div className="text-center text-gray-500">No events saved</div>}
        </div>
      </div>
    </div>
  )
}

async function uploadPhoto(file: File, filename: string): Promise<string | null> {
  try {
  
    const { supabase } = await import("@/lib/supabase")
    const { data, error } = await supabase.storage
      .from("photos-bucket") // Your bucket name
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      console.error("Supabase upload error:", error)
      return null
    }


    const { publicURL, error: urlError } = supabase.storage
      .from("photos-bucket")
      .getPublicUrl(filename)

    if (urlError) {
      console.error("Supabase public URL error:", urlError)
      return null
    }

    return publicURL || null
  } catch (err) {
    console.error("Upload exception:", err)
    return null
  }
}


async function getPhotos(): Promise<Array<{ filename: string; url: string; created_at: string }>> {
  try {
    const { supabase } = await import("@/lib/supabase")
    const { data, error } = await supabase.storage.from("photos-bucket").list("", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    })

    if (error) {
      console.error("Supabase list error:", error)
      return []
    }

    if (!data) return []

    
    const photos = data.map((file) => {
      const url = supabase.storage.from("photos-bucket").getPublicUrl(file.name).publicURL || ""
      return { filename: file.name, url, created_at: file.created_at || "" }
    })

    return photos
  } catch (err) {
    console.error("Get photos exception:", err)
    return []
  }
}

function CameraApp() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [photos, setPhotos] = useState<Array<{ filename: string; url: string; created_at: string }>>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)

  useEffect(() => {
    if (!showGallery) {
      startCamera()
    } else {
      stopCamera()
    }
    return stopCamera
  }, [showGallery, facingMode])


  useEffect(() => {
    loadPhotos()
  }, [])

  async function startCamera() {
    try {
      setPermissionDenied(false)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) videoRef.current.srcObject = mediaStream
    } catch (err: any) {
      console.error("Camera access error:", err)
      if (err.name === "NotAllowedError") setPermissionDenied(true)
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    setStream(null)
  }

  async function loadPhotos() {
    const photosList = await getPhotos()
    setPhotos(photosList)
  }

  async function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    setIsCapturing(true)
    setIsUploading(true)

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsCapturing(false)
        setIsUploading(false)
        return
      }

      const fileName = `photo_${Date.now()}.jpg`
      const file = new File([blob], fileName, { type: "image/jpeg" })

      try {
        const url = await uploadPhoto(file, fileName)
        if (url) {
          setPhotos((prev) => [{ filename: fileName, url, created_at: new Date().toISOString() }, ...prev])
        } else {
          console.warn("Upload returned no URL")
        }
      } catch (err) {
        console.error("Upload failed:", err)
      } finally {
        setIsCapturing(false)
        setIsUploading(false)
      }
    }, "image/jpeg", 0.8)
  }


  async function switchCamera() {
    setFacingMode((current) => (current === "user" ? "environment" : "user"))
  }

  if (showGallery) {
    return (
      <div className="h-full w-full bg-black text-white flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gray-900">
          <button onClick={() => setShowGallery(false)} className="text-blue-400">
            ← Camera
          </button>
          <h2 className="text-lg font-medium">Photos ({photos.length})</h2>
          <div />
        </div>
        <div className="flex-grow overflow-y-auto px-1 pb-6">
          {photos.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <p>No photos yet</p>
              <p className="text-sm mt-2">Supabase Bucket</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {photos.map((photo, index) => (
                <div key={index} className="aspect-square">
                  <img
                    src={photo.url || "/placeholder.svg"}
                    alt={photo.filename}
                    className="w-full h-full object-cover rounded"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-black relative overflow-hidden">
      {permissionDenied && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center text-white p-6 z-20">
          <Camera className="w-16 h-16 mb-4" />
          <p className="text-lg mb-2">Camera access denied</p>
          <p className="text-center text-sm">
            Please enable camera permissions in your browser settings.
          </p>
        </div>
      )}

      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-black/30 backdrop-blur-md">
        <button
          onClick={(e) => {
            e.stopPropagation()
            stopCamera()
            setShowGallery(true)
          }}
          className="text-white bg-white/20 px-4 py-2 rounded-full text-sm"
        >
          Gallery
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            switchCamera()
          }}
          disabled={isCapturing || isUploading}
          className={cn(
            "w-16 h-16 rounded-full border-4 border-white flex items-center justify-center",
            isCapturing || isUploading ? "bg-red-500" : "bg-white/30"
          )}
        >
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="w-12 h-12 bg-white rounded-full" />
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            if (!isCapturing && !isUploading) capturePhoto()
          }}
          disabled={isCapturing || isUploading || permissionDenied}
          className={cn(
            "w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-lg font-bold select-none",
            isCapturing || isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"
          )}
        >
          ●
        </button>
      </div>

      {(isUploading || isCapturing) && (
        <div className="absolute bottom-24 w-full text-center text-white text-sm">Saving photo...</div>
      )}

      {!stream && !permissionDenied && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white p-4">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">Allow camera access to take photos</p>
          </div>
        </div>
      )}
    </div>
  )
}



function BrowserApp() {
  const [url, setUrl] = useState("")
  const [currentUrl, setCurrentUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const quickLinks = [
    { name: "Google", url: "https://www.google.com/search?igu=1" },
    { name: "Meta Mirror", url: "https://meta-mirror.vercel.app" },
    { name: "NeoMoji", url: "https://neomoji-beta.netlify.app" },
    { name: "NES", url: "https://tyson.JesseJesse.com" },
  ]

  const formatUrl = (inputUrl: string) => {
    if (!inputUrl) return ""
    if (!inputUrl.includes(".") || inputUrl.includes(" ")) {
      return `https://www.google.com/search?q=${encodeURIComponent(inputUrl)}`
    }
    if (!inputUrl.startsWith("http://") && !inputUrl.startsWith("https://")) {
      return `https://${inputUrl}`
    }
    return inputUrl
  }

  const loadUrl = (targetUrl: string) => {
    const formattedUrl = formatUrl(targetUrl)
    if (!formattedUrl) return

    setIsLoading(true)
    setCurrentUrl(formattedUrl)

    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(formattedUrl)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)

    setCanGoBack(newHistory.length > 1)
    setCanGoForward(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadUrl(url)
  }

  const goBack = () => {
    if (canGoBack && historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setCurrentUrl(history[newIndex])
      setCanGoBack(newIndex > 0)
      setCanGoForward(true)
    }
  }

  const goForward = () => {
    if (canGoForward && historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setCurrentUrl(history[newIndex])
      setCanGoForward(newIndex < history.length - 1)
      setCanGoBack(true)
    }
  }

  const refresh = () => {
    if (currentUrl && iframeRef.current) {
      setIsLoading(true)
      iframeRef.current.src = currentUrl
    }
  }

  const goHome = () => {
    setCurrentUrl("")
    setIsLoading(false)
  }

  return (
    <div className="h-full bg-gray-100 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={goHome} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200" title="Home">
            🏠
          </button>
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className={cn("p-2 rounded-full", canGoBack ? "bg-gray-100 hover:bg-gray-200" : "bg-gray-50 text-gray-400")}
          >
            ←
          </button>
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className={cn(
              "p-2 rounded-full",
              canGoForward ? "bg-gray-100 hover:bg-gray-200" : "bg-gray-50 text-gray-400",
            )}
          >
            →
          </button>
          <button onClick={refresh} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            ↻
          </button>
        </div>

       
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Search or enter website URL"
              className="w-full px-4 py-2 bg-gray-100 rounded-full border-none outline-none text-sm"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600">
            Go
          </button>
        </form>
      </div>

    
      <div className="flex-1 relative">
        {currentUrl ? (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            className="w-full h-full border-none"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            title="Browser content"
          />
        ) : (
          <div className="h-full bg-white p-6">
            <div className="text-center mb-6">
              <Globe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Random Web Browser</h2>
              <p className="text-gray-600 text-sm">iphone-tsx.vercel.app</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setUrl(link.url)
                      loadUrl(link.url)
                    }}
                    className={cn(
                      "p-3 rounded-lg text-white text-sm font-semibold flex items-center justify-center transition-all hover:scale-[1.02]",
                      ["bg-blue-600", "bg-red-500", "bg-gray-800", "bg-purple-600", "bg-green-600", "bg-pink-600"][
                        index % 6
                      ],
                    )}
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Tip: search directly any website or URL</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CalculatorApp() {
  const [display, setDisplay] = useState("0")
  const [operation, setOperation] = useState<string | null>(null)
  const [prevValue, setPrevValue] = useState<number | null>(null)
  const [resetDisplay, setResetDisplay] = useState(false)

  const handleNumberClick = (num: string) => {
    if (display === "0" || resetDisplay) {
      setDisplay(num)
      setResetDisplay(false)
    } else {
      setDisplay(display + num)
    }
  }

  const handleOperationClick = (op: string) => {
    setOperation(op)
    setPrevValue(Number.parseFloat(display))
    setResetDisplay(true)
  }

  const handleEqualsClick = () => {
    if (operation && prevValue !== null) {
      let result = 0
      const currentValue = Number.parseFloat(display)

      switch (operation) {
        case "+":
          result = prevValue + currentValue
          break
        case "-":
          result = prevValue - currentValue
          break
        case "×":
          result = prevValue * currentValue
          break
        case "÷":
          result = prevValue / currentValue
          break
      }

      setDisplay(result.toString())
      setOperation(null)
      setPrevValue(null)
      setResetDisplay(true)
    }
  }

  const handleClearClick = () => {
    setDisplay("0")
    setOperation(null)
    setPrevValue(null)
    setResetDisplay(false)
  }

  return (
    <div className="flex flex-col h-full bg-black text-white">
    
      <div className="h-16 flex items-end justify-end px-4 text-4xl font-light">{display}</div>

     
      <div className="grid grid-cols-4 gap-x-1 gap-y-1 p-2 pb-4">
        <CalcButton onClick={handleClearClick} className="bg-gray-500">
          AC
        </CalcButton>
        <CalcButton onClick={() => {}} className="bg-gray-500">
          +/-
        </CalcButton>
        <CalcButton onClick={() => {}} className="bg-gray-500">
          %
        </CalcButton>
        <CalcButton onClick={() => handleOperationClick("÷")} className="bg-orange-500">
          ÷
        </CalcButton>

        <CalcButton onClick={() => handleNumberClick("7")}>7</CalcButton>
        <CalcButton onClick={() => handleNumberClick("8")}>8</CalcButton>
        <CalcButton onClick={() => handleNumberClick("9")}>9</CalcButton>
        <CalcButton onClick={() => handleOperationClick("×")} className="bg-orange-500">
          ×
        </CalcButton>

        <CalcButton onClick={() => handleNumberClick("4")}>4</CalcButton>
        <CalcButton onClick={() => handleNumberClick("5")}>5</CalcButton>
        <CalcButton onClick={() => handleNumberClick("6")}>6</CalcButton>
        <CalcButton onClick={() => handleOperationClick("-")} className="bg-orange-500">
          -
        </CalcButton>

        <CalcButton onClick={() => handleNumberClick("1")}>1</CalcButton>
        <CalcButton onClick={() => handleNumberClick("2")}>2</CalcButton>
        <CalcButton onClick={() => handleNumberClick("3")}>3</CalcButton>
        <CalcButton onClick={() => handleOperationClick("+")} className="bg-orange-500">
          +
        </CalcButton>

        <CalcButton onClick={() => handleNumberClick("0")} className="col-span-2">
          0
        </CalcButton>
        <CalcButton onClick={() => handleNumberClick(".")}>.</CalcButton>
        <CalcButton onClick={handleEqualsClick} className="bg-orange-500">
          =
        </CalcButton>
      </div>
    </div>
  )
}

function CalcButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn("h-9 rounded-full flex items-center justify-center bg-gray-800 font-medium", className)}
    >
      {children}
    </button>
  )
}
