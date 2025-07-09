export interface PhoneSettings {
  wallpaper: string
  lockScreenWallpaper: string
  taskbarColor: string
  homeButtonStyle: "circle" | "square" | "pill"
  statusBarStyle: "light" | "dark"
  appIconStyle: "rounded" | "square" | "circle"
  deviceName: string
  batteryPercentage: boolean
}

export const defaultSettings: PhoneSettings = {
  wallpaper:
    "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/wallpaper_iphone.png?alt=media&token=f87e9198-2f22-4f65-89fd-f599a5ddcd34",
  lockScreenWallpaper:
    "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/apple-ios-wallpapers.jpg?alt=media&token=d9e65040-0131-4fa7-8224-5293b1e126e0",
  taskbarColor: "black/30",
  homeButtonStyle: "circle",
  statusBarStyle: "light",
  appIconStyle: "rounded",
  deviceName: "iPhone TSX",
  batteryPercentage: true,
}

export const wallpaperOptions = [
  {
    name: "Default Blue",
    url: "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/wallpaper_iphone.png?alt=media&token=f87e9198-2f22-4f65-89fd-f599a5ddcd34",
  },
  {
    name: "Abstract Purple",
    url: "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/apple-ios-wallpapers.jpg?alt=media&token=d9e65040-0131-4fa7-8224-5293b1e126e0",
  },
  {
    name: "Dark Gradient",
    url: "/placeholder.svg?height=750&width=375&text=Dark+Gradient",
  },
  {
    name: "Light Gradient",
    url: "/placeholder.svg?height=750&width=375&text=Light+Gradient",
  },
]

export const taskbarColorOptions = [
  { name: "Default", value: "black/30" },
  { name: "Dark", value: "black/60" },
  { name: "Blue", value: "blue-900/40" },
  { name: "Purple", value: "purple-900/40" },
  { name: "Green", value: "green-900/40" },
  { name: "Red", value: "red-900/40" },
]


export function saveSettings(settings: PhoneSettings) {
  if (typeof window !== "undefined") {
    localStorage.setItem("phoneSettings", JSON.stringify(settings))
  }
}


export function loadSettings(): PhoneSettings {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("phoneSettings")
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }
  }
  return defaultSettings
}
