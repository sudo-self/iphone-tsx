"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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
  Music,
  MapIcon,
  FileText,
  Loader2,
  Folder,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getContacts } from "@/lib/redis";
import {
  type PhoneSettings,
  defaultSettings,
  loadSettings,
  saveSettings,
} from "@/lib/settings";

import { Redis } from "@upstash/redis";
import DriveApp from "@/components/DriveApp";
import GooglePicker from "@/components/GooglePicker"
import { useSession } from "next-auth/react";

import PhoneApp from "./PhoneApp";
import ContactsApp from "./ContactsApp";
import CalendarApp from "./CalendarApp";
import CalculatorApp from "./CalculatorApp";
import CameraApp from "./CameraApp";
import BrowserApp from "./BrowserApp";
import MusicApp from "./MusicApp";
import MapsApp from "./MapsApp";
import SettingsApp from "./SettingsApp";
import NotesApp from "./NotesApp";
import SnakeApp from "./SnakeApp";
import { Redis } from "@upstash/redis";

export default function SmartphoneUI() {
  const [isLocked, setIsLocked] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [contacts, setContacts] = useState<
    Array<{ name: string; phone: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<PhoneSettings>(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
      setCurrentDate(
        now.toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!isLocked) {
        setIsLoading(true);
        try {
          const contactsList = await getContacts();
          setContacts(contactsList);
        } catch (error) {
          console.error("Failed to fetch contacts:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchContacts();
  }, [isLocked, activeApp]);

  const handleUnlock = () => {
    setIsLocked(false);
  };

  const handleLock = () => {
    setIsLocked(true);
    setActiveApp(null);
  };

  const openApp = (appName: string) => {
    setActiveApp(appName);
  };

  const goHome = () => {
    setActiveApp(null);
  };

  const refreshContacts = async () => {
    setIsLoading(true);
    try {
      const contactsList = await getContacts();
      setContacts(contactsList);
    } catch (error) {
      console.error("Failed to refresh contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = (newSettings: PhoneSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const getHomeButtonStyle = () => {
    switch (settings.homeButtonStyle) {
      case "square":
        return "w-12 h-12 rounded-lg border-2 border-white/50";
      case "pill":
        return "w-16 h-8 rounded-full border-2 border-white/50";
      default:
        return "w-12 h-12 rounded-full border-2 border-white/50";
    }
  };

  const getAppIconStyle = () => {
    switch (settings.appIconStyle) {
      case "square":
        return "w-14 h-14 rounded-lg";
      case "circle":
        return "w-14 h-14 rounded-full";
      default:
        return "w-14 h-14 rounded-2xl";
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 p-4">
      <div className="relative w-full max-w-[375px] h-[750px] bg-black rounded-[40px] overflow-hidden shadow-2xl border-[14px] border-black">
        <div className="absolute right-[-14px] top-[120px] w-[4px] h-[40px] bg-gray-700 rounded-r-sm"></div>

        <div className="absolute left-[-14px] top-[100px] w-[4px] h-[30px] bg-gray-700 rounded-l-sm"></div>
        <div className="absolute left-[-14px] top-[140px] w-[4px] h-[30px] bg-gray-700 rounded-l-sm"></div>

        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-[14px] z-50"></div>

        <div className="relative w-full h-full bg-gray-900 overflow-hidden">
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-12 px-6 flex justify-between items-center z-40",
              settings.statusBarStyle === "dark"
                ? "text-gray-800"
                : "text-gray-200"
            )}
          >
            <div className="flex flex-col text-left text-sm font-medium leading-tight">
              <span>{settings.deviceName}</span>
              <span className="text-xs">{currentTime}</span>
            </div>

            <div className="flex items-center gap-2">
              <Signal className="w-4 h-4" />
              <Wifi className="w-4 h-4" />
              <div className="flex items-center">
                {settings.batteryPercentage && (
                  <span className="text-xs mr-1 text-green-700">
                    {batteryLevel}%
                  </span>
                )}
                <Battery className="w-5 h-5" />
              </div>
            </div>
          </div>

          {isLocked ? (
            <div
              className="absolute inset-0 flex flex-col items-center bg-cover bg-center"
              style={{
                backgroundImage: `url('${settings.lockScreenWallpaper}')`,
              }}
            >
              <div className="mt-20 text-white text-center">
                <div className="text-6xl font-light">{currentTime}</div>
                <div className="mt-2 text-lg">{currentDate}</div>
              </div>

              <div className="mt-auto mb-10 flex flex-col items-center">
                <div className="p-4 rounded-full mb-4">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <button
                  onClick={handleUnlock}
                  className="text-white text-lg font-light flex items-center"
                >
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
                    <h2 className="text-white text-lg font-medium">
                      {activeApp}
                    </h2>
                    {(activeApp === "Contacts" || activeApp === "Phone") && (
                      <button
                        onClick={refreshContacts}
                        className="text-blue-400 text-sm"
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading..." : "Refresh"}
                      </button>
                    )}
                  </div>

                  {activeApp === "Phone" && <PhoneApp contacts={contacts} />}
                  {activeApp === "Contacts" && (
                    <ContactsApp
                      contacts={contacts}
                      onContactsChange={refreshContacts}
                    />
                  )}
                  {activeApp === "Calendar" && <CalendarApp />}
                  {activeApp === "Calculator" && <CalculatorApp />}
                  {activeApp === "Camera" && <CameraApp />}
                  {activeApp === "Browser" && <BrowserApp />}
                  {activeApp === "Music" && <MusicApp />}
                  {activeApp === "Maps" && (
                    <MapsApp setActiveApp={setActiveApp} />
                  )}
                  {activeApp === "Settings" && (
                    <SettingsApp
                      settings={settings}
                      onSettingsChange={updateSettings}
                    />
                  )}
                  {activeApp === "Notes" && <NotesApp />}
                  {activeApp === "Drive" && <DriveApp />}
                </div>
              ) : (
                <div
                  className="h-full flex flex-col bg-cover bg-center"
                  style={{ backgroundImage: `url('${settings.wallpaper}')` }}
                >
                  <div className="flex-1 grid grid-cols-4 gap-4 p-6 mt-8">
                   <AppIcon
                     name="Google"
                     icon={<Folder />}
                     onClick={() => openApp("Drive")}
                     iconStyle={getAppIconStyle()}
                   />
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
                    <AppIcon
                      name="Music"
                      icon={<Music />}
                      onClick={() => openApp("Music")}
                      iconStyle={getAppIconStyle()}
                    />
                    <AppIcon
                      name="Maps"
                      icon={<MapIcon />}
                      onClick={() => openApp("Maps")}
                      iconStyle={getAppIconStyle()}
                    />
                    <AppIcon
                      name="Notes"
                      icon={<FileText />}
                      onClick={() => openApp("Notes")}
                      iconStyle={getAppIconStyle()}
                    />
                  </div>
                </div>
              )}

              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-16 backdrop-blur-md flex justify-center items-center",
                  `bg-${settings.taskbarColor}`
                )}
              >
                <button
                  onClick={activeApp ? goHome : handleLock}
                  className={getHomeButtonStyle()}
                ></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AppIcon({
  name,
  icon,
  onClick,
  iconStyle,
}: {
  name: string;
  icon: React.ReactNode;
  onClick: () => void;
  iconStyle: string;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center">
      <div
        className={cn(
          iconStyle,
          "bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white mb-1"
        )}
      >
        {icon}
      </div>
      <span className="text-xs text-white">{name}</span>
    </button>
  );
}

function SettingsApp({
  settings,
  onSettingsChange,
}: {
  settings: PhoneSettings;
  onSettingsChange: (settings: PhoneSettings) => void;
}) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const settingSections = [
    { id: "display", name: "Display", icon: "🤩" },
    { id: "wallpaper", name: "Wallpaper", icon: "📱" },
    { id: "general", name: "General", icon: "⚙️" },
    { id: "about", name: "About", icon: "ℹ️" },
  ];

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
      name: "iphone 14",
      url: "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/lockscreen.jpg?alt=media&token=406ef44d-c8f3-4796-99ad-8feee27352da",
    },
    {
      name: "iPad mini",
      url: "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/ipad_wallpaper.png?alt=media&token=cb015e53-1df5-4474-96bf-789e39c6cffa",
    },
     {
      name: "Glitter Pro",
      url: "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/iphoneglow.png?alt=media&token=a530a871-13fe-4e00-b8d6-7ebedc6cee1e",
    },
     {
      name: "iphone 15",
      url: "https://firebasestorage.googleapis.com/v0/b/jessejessexyz.appspot.com/o/wp14611835-apple-iphone-15-pro-wallpapers.jpg?alt=media&token=75445df9-7e4a-4eb2-8d87-dc41889b56b3",
    },
  ];

  const taskbarColorOptions = [
    { name: "Default", value: "black/30" },
    { name: "Dark", value: "black/60" },
    { name: "Blue", value: "blue-900/40" },
    { name: "Purple", value: "purple-900/40" },
    { name: "Green", value: "green-900/40" },
    { name: "Red", value: "red-900/40" },
  ];

  if (activeSection === "wallpaper") {
    return (
      <div className="h-full bg-gray-900 text-white flex flex-col overflow-y-auto">
        <div className="flex items-center mb-6 px-4 pt-4 flex-shrink-0">
          <button
            onClick={() => setActiveSection(null)}
            className="text-blue-400 mr-4"
          >
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
                  onClick={() =>
                    onSettingsChange({ ...settings, wallpaper: option.url })
                  }
                  className={cn(
                    "relative aspect-[3/4] rounded-lg overflow-y-auto border-2",
                    settings.wallpaper === option.url
                      ? "border-blue-500"
                      : "border-gray-600"
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
                  onClick={() =>
                    onSettingsChange({
                      ...settings,
                      lockScreenWallpaper: option.url,
                    })
                  }
                  className={cn(
                    "relative aspect-[3/4] rounded-lg overflow-y-auto border-2",
                    settings.lockScreenWallpaper === option.url
                      ? "border-blue-500"
                      : "border-gray-600"
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
    );
  }

  if (activeSection === "display") {
    return (
      <div className="h-full bg-gray-900 text-white flex flex-col overflow-y-auto">
        <div className="flex items-center mb-6 px-4 pt-4 flex-shrink-0">
          <button
            onClick={() => setActiveSection(null)}
            className="text-blue-400 mr-4"
          >
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
                    onClick={() =>
                      onSettingsChange({
                        ...settings,
                        taskbarColor: option.value,
                      })
                    }
                    className={cn(
                      "p-3 rounded-lg border-2 text-left",
                      settings.taskbarColor === option.value
                        ? "border-blue-500 bg-blue-900/20"
                        : "border-gray-600 bg-gray-800"
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
                    onClick={() =>
                      onSettingsChange({
                        ...settings,
                        homeButtonStyle: option.value,
                      })
                    }
                    className={cn(
                      "p-3 rounded-lg border-2 text-center",
                      settings.homeButtonStyle === option.value
                        ? "border-blue-500 bg-blue-900/20"
                        : "border-gray-600 bg-gray-800"
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
                    onClick={() =>
                      onSettingsChange({
                        ...settings,
                        appIconStyle: option.value,
                      })
                    }
                    className={cn(
                      "p-3 rounded-lg border-2 text-center",
                      settings.appIconStyle === option.value
                        ? "border-blue-500 bg-blue-900/20"
                        : "border-gray-600 bg-gray-800"
                    )}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 overflow-y-auto">Status Bar</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span>Show Battery Percentage</span>
                  <button
                    onClick={() =>
                      onSettingsChange({
                        ...settings,
                        batteryPercentage: !settings.batteryPercentage,
                      })
                    }
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      settings.batteryPercentage ? "bg-blue-600" : "bg-gray-600"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                        settings.batteryPercentage
                          ? "translate-x-6"
                          : "translate-x-0.5"
                      )}
                    />
                  </button>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "general") {
    return (
      <div className="h-full bg-gray-900 text-white flex flex-col">
        <div className="flex items-center mb-6 px-4 pt-4 flex-shrink-0">
          <button
            onClick={() => setActiveSection(null)}
            className="text-blue-400 mr-4"
          >
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
                onChange={(e) =>
                  onSettingsChange({ ...settings, deviceName: e.target.value })
                }
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                placeholder="Enter device name"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Factory Mode</h3>
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
                  };
                  onSettingsChange(defaultSettings);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Reset iPhone
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "about") {
    return (
      <div className="h-full bg-gray-900 text-white flex flex-col">
        <div className="flex items-center mb-6 px-4 pt-4 flex-shrink-0">
          <button
            onClick={() => setActiveSection(null)}
            className="text-blue-400 mr-4"
          >
            ← Back
          </button>
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
                <span className="text-orange-400">2.23</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Model</span>
                <span className="text-blue-500">US</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Storage</span>
                <span className="text-yellow-400">20TB</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Battery Health</span>
                <span className="text-green-500">Excellent</span>
              </div>
            </div>

          <div className="mt-4 text-center text-pink-400 text-xs">
  <p>npx create-next-app@latest iphone-tsx</p>
</div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
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

        <div className="mt-8 text-center text-cyan-500 text-sm">
         <p>ⓛⓞⓥⓔ</p>
        </div>
      </div>
    </div>
  );
}

function DriveApp() {
  const { data: session, status } = useSession();

  const handlePick = (file: any) => {
    alert(`Picked: ${file.name}`);
    console.log(file);
  };

  if (status === "loading") {
    return <p className="text-center p-4">Loading session...</p>;
  }

  if (!session) {
    return <p className="text-center p-4">Please sign in to access Google Drive.</p>;
  }

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-xl font-semibold mb-4">Google Drive</h2>
      <GooglePicker onPick={handlePick} />
    </div>
  );
}





function PhoneApp({
  contacts,
}: {
  contacts: Array<{ name: string; phone: string }>;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
  );

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
            <div
              key={index}
              className="flex items-center p-3 border-b border-gray-800"
            >
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                {contact.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium hover:text-green-600">
                  {contact.name}
                </div>
                <a
                  href={`tel:${String(contact.phone || "").replace(
                    /[^+\d]/g,
                    ""
                  )}`}
                >
                  {contact.phone}
                </a>
              </div>
              <Phone className="w-5 h-5 ml-auto text-green-500" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SkipBack = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" y1="19" x2="5" y2="5" />
  </svg>
);
const SkipForward = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </svg>
);

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Track {
  id: number;
  title: string;
  artist: string;
  videoId: string;
}

const sampleTracks: Track[] = [
  {
    id: 1,
    title: "You Only Live Once",
    artist: "The Strokes",
    videoId: "pT68FS3YbQ4",
  },
  {
    id: 2,
    title: "I was running through the six",
    artist: "Drake",
    videoId: "jqScSp5l-AQ",
  },
  { id: 3, title: "Undercover", artist: "Lane 8", videoId: "HSydHbGdIcY" },
  {
    id: 4,
    title: "King of Everything",
    artist: "Wiz Khalifa",
    videoId: "8d0cm_hcQes",
  },
  {
    id: 5,
    title: "Cant Sleep",
    artist: "Super 8 Tab",
    videoId: "1coNgmWS0fs",
  },
  {
    id: 7,
    title: "Addicted",
    artist: "Logic",
    videoId: "3dofrKm_Usw",
  },
   {
    id: 8,
    title: "Palm Trees",
    artist: "Flatbush Zombies",
    videoId: "kfzRXseSBIM",
  },
  {
    id: 9,
    title: "Time is the Enemy",
    artist: "Quantic",
    videoId: "nvUeo5sagkA",
  },
  {
    id: 10,
    title: "Chill Drive",
    artist: "Lo-Fi",
    videoId: "iicfmXFALM8",

  },
];



function MusicApp() {
  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayer = useRef<any>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack = sampleTracks[currentIndex];

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      ytPlayer.current = new window.YT.Player(playerRef.current, {
        height: "240",
        width: "426",
        videoId: currentTrack.videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            ytPlayer.current.setVolume(volume);
            setDuration(ytPlayer.current.getDuration());
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              playNext();
            }
          },
        },
      });
    };
  }, []);

  useEffect(() => {
    if (ytPlayer.current && isReady) {
      ytPlayer.current.loadVideoById(currentTrack.videoId);
      setIsPlaying(true);
      setProgress(0);
    }
  }, [currentIndex, isReady, currentTrack.videoId]);

  useEffect(() => {
    if (!ytPlayer.current || !isReady) return;
    if (isPlaying) {
      ytPlayer.current.playVideo();
    } else {
      ytPlayer.current.pauseVideo();
    }
  }, [isPlaying, isReady]);

  useEffect(() => {
    if (ytPlayer.current && isReady) {
      ytPlayer.current.setVolume(volume);
    }
  }, [volume, isReady]);

  useEffect(() => {
    if (!ytPlayer.current) return;

    const interval = setInterval(() => {
      if (ytPlayer.current && ytPlayer.current.getCurrentTime) {
        setProgress(ytPlayer.current.getCurrentTime());
        setDuration(ytPlayer.current.getDuration());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const playPrev = () => {
    setCurrentIndex((i) => (i === 0 ? sampleTracks.length - 1 : i - 1));
  };

  const playNext = () => {
    setCurrentIndex((i) => (i === sampleTracks.length - 1 ? 0 : i + 1));
  };

  const seekTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setProgress(time);
    if (ytPlayer.current && isReady) {
      ytPlayer.current.seekTo(time, true);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center p-6 space-y-6 overflow-y-auto">
      <div
        ref={playerRef}
        style={{ maxWidth: "426px", width: "100%", marginBottom: "1rem" }}
      />

      <div className="text-center">
        <h2 className="text-2xl font-bold">{currentTrack.title}</h2>
        <p className="text-gray-400">{currentTrack.artist}</p>
      </div>

      <input
        type="range"
        min={0}
        max={duration}
        value={progress}
        onChange={seekTo}
        className="w-full max-w-md"
        aria-label="Seek video"
      />

      <div className="flex items-center gap-8">
        <button onClick={playPrev} aria-label="Previous Track" type="button">
          <SkipBack className="w-8 h-8" />
        </button>
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="px-6 py-3 bg-white text-black rounded-full text-lg"
          aria-label={isPlaying ? "Pause" : "Play"}
          type="button"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button onClick={playNext} aria-label="Next Track" type="button">
          <SkipForward className="w-8 h-8" />
        </button>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="w-full max-w-md"
        aria-label="Volume control"
      />
    </div>
  );
}

function ContactsApp({
  contacts,
  onContactsChange,
}: {
  contacts: Array<{ name: string; phone: string }>;
  onContactsChange: () => Promise<void>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
  );

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    setIsSubmitting(true);
    try {
      const { addContact } = await import("@/lib/redis");
      await addContact(newName, newPhone);
      setNewName("");
      setNewPhone("");
      setShowAddForm(false);
      await onContactsChange();
    } catch (error) {
      console.error("Failed to add contact:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContact = async (name: string) => {
    try {
      const { deleteContact } = await import("@/lib/redis");
      await deleteContact(name);
      await onContactsChange();
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

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
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white p-2 rounded-full"
        >
          {showAddForm ? "×" : "+"}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddContact}
          className="bg-gray-800 p-4 rounded-lg mb-4"
        >
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
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md"
            disabled={isSubmitting}
          >
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
            <div
              key={index}
              className="flex items-center p-3 border-b border-gray-800"
            >
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                {contact.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{contact.name}</div>
                <div className="text-sm text-gray-400">{contact.phone}</div>
              </div>
              <button
                onClick={() => handleDeleteContact(contact.name)}
                className="text-red-500 p-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MapsApp({
  setActiveApp,
}: {
  setActiveApp: (app: string | null) => void;
}) {
  const [selectedLocation, setSelectedLocation] = useState("Denver, CO");
  const [searchQuery, setSearchQuery] = useState("");

  const locations = [
    {
      name: "Denver, CO",
      coords: "39.7392°N, 104.9903°W",
      description: "Mile High City",
    },
    {
      name: "New York, NY",
      coords: "40.7128°N, 74.0060°W",
      description: "The Big Apple",
    },
    {
      name: "Los Angeles, CA",
      coords: "34.0522°N, 118.2437°W",
      description: "City of Angels",
    },
    {
      name: "Chicago, IL",
      coords: "41.8781°N, 87.6298°W",
      description: "Windy City",
    },
    {
      name: "Miami, FL",
      coords: "25.7617°N, 80.1918°W",
      description: "Magic City",
    },
  ];

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="flex items-center p-4 bg-gray-800 flex-shrink-0">
        <button
          onClick={() => setActiveApp(null)}
          className="text-blue-400 mr-4"
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold">Maps</h2>
      </div>

      <div className="p-4 flex-shrink-0">
        <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 mb-4">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search locations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="bg-gray-800 rounded-lg p-6 mb-4 text-center">
          <MapIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">{selectedLocation}</h3>
          <p className="text-gray-400 mb-4">
            {locations.find((loc) => loc.name === selectedLocation)?.coords}
          </p>
          <div className="w-full h-32 bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-400">Map View</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-medium mb-3">Locations</h4>
          {filteredLocations.map((location, index) => (
            <button
              key={index}
              onClick={() => setSelectedLocation(location.name)}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-colors",
                selectedLocation === location.name
                  ? "bg-blue-600"
                  : "bg-gray-800 hover:bg-gray-700"
              )}
            >
              <div className="font-medium">{location.name}</div>
              <div className="text-sm text-gray-400">
                {location.description}
              </div>
              <div className="text-xs text-gray-500">{location.coords}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CameraApp() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photos, setPhotos] = useState<
    Array<{ filename: string; url: string; created_at: string }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!showGallery) {
      startCamera();
    } else {
      stopCamera();
    }
    return stopCamera;
  }, [showGallery, facingMode]);

  useEffect(() => {
    loadPhotos();
  }, []);

  async function startCamera() {
    try {
      setPermissionDenied(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError") setPermissionDenied(true);
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
  }

  async function loadPhotos() {
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await supabase.storage
        .from("photos-bucket")
        .list("", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) {
        console.error("Supabase list error:", error);
        return;
      }

      if (!data) return;

      const photosList = data.map((file) => {
        const { data: urlData } = supabase.storage
          .from("photos-bucket")
          .getPublicUrl(file.name);
        return {
          filename: file.name,
          url: urlData.publicUrl || "",
          created_at: file.created_at || "",
        };
      });

      setPhotos(photosList);
    } catch (error) {
      console.error("Failed to load photos:", error);
    }
  }

  async function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);
    setIsUploading(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setIsCapturing(false);
          setIsUploading(false);
          return;
        }

        const fileName = `photo_${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: "image/jpeg" });

        try {
          const { supabase } = await import("@/lib/supabase");
          const { data, error } = await supabase.storage
            .from("photos-bucket")
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (error) {
            console.error("Supabase upload error:", error);
          } else {
            const { data: urlData } = supabase.storage
              .from("photos-bucket")
              .getPublicUrl(fileName);
            const url = urlData.publicUrl;
            if (url) {
              setPhotos((prev) => [
                {
                  filename: fileName,
                  url,
                  created_at: new Date().toISOString(),
                },
                ...prev,
              ]);
            }
          }
        } catch (err) {
          console.error("Upload failed:", err);
        } finally {
          setIsCapturing(false);
          setIsUploading(false);
        }
      },
      "image/jpeg",
      0.8,
    );
  }

  async function switchCamera() {
    setFacingMode((current) => (current === "user" ? "environment" : "user"));
  }

  if (showGallery) {
    return (
      <div className="h-full w-full bg-black text-white flex flex-col">
        <div className="flex items-center justify-between p-4 bg-gray-900 flex-shrink-0">
          <button
            onClick={() => setShowGallery(false)}
            className="text-blue-400"
          >
            ← Camera
          </button>
          <h2 className="text-lg font-medium">Photos ({photos.length})</h2>
          <div className="w-16" />
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-6">
          {photos.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <Camera className="w-16 h-16 mx-auto mb-4" />
              <p>No photos yet</p>
              <p className="text-sm mt-2">Take some photos to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {photos.map((photo, index) => (
                <div key={index} className="aspect-square">
                  <img
                    src={photo.url || "/placeholder.svg?height=150&width=150"}
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
    );
  }

  return (
    <div className="h-full w-full bg-black relative flex flex-col">
      {permissionDenied && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center text-white p-6 z-20">
          <Camera className="w-16 h-16 mb-4" />
          <p className="text-lg mb-2">Camera access denied</p>
          <p className="text-center text-sm">
            Please enable camera permissions in your browser settings.
          </p>
        </div>
      )}

      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex-shrink-0 p-6 bg-black/50 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              stopCamera();
              setShowGallery(true);
            }}
            className="flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-1">
              <div className="w-6 h-6 bg-white/60 rounded"></div>
            </div>
            <span className="text-xs">Gallery</span>
          </button>

          <button
            onClick={() => {
              if (!isCapturing && !isUploading) capturePhoto();
            }}
            disabled={isCapturing || isUploading || permissionDenied}
            className={cn(
              "w-20 h-20 rounded-full border-4 border-white flex items-center justify-center",
              isCapturing || isUploading
                ? "bg-red-500"
                : "bg-white/30 hover:bg-white/40",
            )}
          >
            {isUploading ? (
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="w-16 h-16 bg-white rounded-full"></div>
            )}
          </button>

          <button
            onClick={switchCamera}
            disabled={isCapturing || isUploading}
            className="flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-1">
              <div className="w-6 h-6 border-2 border-white/60 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              </div>
            </div>
            <span className="text-xs">Flip</span>
          </button>
        </div>

        {(isUploading || isCapturing) && (
          <div className="text-center text-white text-sm mt-4">
            {isCapturing ? "Capturing..." : "Saving photo..."}
          </div>
        )}
      </div>

      {!stream && !permissionDenied && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white p-4">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">Starting camera...</p>
            <p className="text-sm text-gray-400">Please allow camera access</p>
          </div>
        </div>
      )}
    </div>
  );
}

function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("notes");
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadNotes();
  }, [viewMode]);


  const loadNotes = async () => {
    console.log("Loading notes..."); // Debug log
    setLoading(true);
    try {
      const { redis } = await import("@/lib/redis");
      const notesData = (await redis.hgetall("notes")) || {};
      console.log("Raw Redis data:", notesData); // Debug log

      const notesList = [];
      for (const [id, data] of Object.entries(notesData)) {
        try {
        
          const parsedData = typeof data === "string" ? JSON.parse(data) : data;
          notesList.push({
            id,
            title: parsedData.title || "",
            content: parsedData.content || "",
            created_at: parsedData.created_at || new Date().toISOString(),
            type: parsedData.type || "notes",
            completed: parsedData.completed || false,
          });
        } catch (error) {
          console.error(`Error parsing note ${id}:`, error);
        }
      }


      notesList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotes(notesList);
      console.log("Processed notes:", notesList); // Debug log
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const { redis } = await import("@/lib/redis");
      const id = Date.now().toString();
      const noteData = {
        title: newTitle.trim(),
        content: newContent.trim(),
        created_at: new Date().toISOString(),
        type: viewMode,
        completed: viewMode === "todos" ? false : undefined,
      };

      await redis.hset("notes", { [id]: JSON.stringify(noteData) });
      console.log("Note added:", noteData); // Debug log


      setNewTitle("");
      setNewContent("");
      setShowAddForm(false);
      await loadNotes();
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDeleteNote = async (id) => {
    try {
      const { redis } = await import("@/lib/redis");
      await redis.hdel("notes", id);
      await loadNotes(); // Force reload
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };


  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = note.type === viewMode;
    return matchesSearch && matchesMode;
  });

  // Render UI
  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Header and search */}
      <div className="p-4 bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("notes")}
              className={cn(
                "px-3 py-1 rounded text-sm",
                viewMode === "notes"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300",
              )}
            >
              Notes
            </button>
            <button
              onClick={() => setViewMode("todos")}
              className={cn(
                "px-3 py-1 rounded text-sm",
                viewMode === "todos"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300",
              )}
            >
              Todos
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white p-2 rounded-full"
          >
            {showAddForm ? "×" : "+"}
          </button>
        </div>

        <div className="flex items-center bg-gray-700 rounded-full px-4 py-2">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder={`Search ${viewMode}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-white"
          />
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <form onSubmit={handleAddNote} className="space-y-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
              placeholder={
                viewMode === "notes" ? "Note title..." : "Todo item..."
              }
              required
            />
            {viewMode === "notes" && (
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md h-20 resize-none"
                placeholder="Note content..."
              />
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : `Add ${viewMode === "notes" ? "Note" : "Todo"}`}
            </button>
          </form>
        </div>
      )}

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-400 mt-8">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
            <p>Loading {viewMode}...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <p>No {viewMode} yet</p>
            <p className="text-sm mt-2">
              Tap + to create your first{" "}
              {viewMode === "notes" ? "note" : "todo"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <div key={note.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{note.title}</h3>
                    {note.content && (
                      <p className="text-sm text-gray-400">{note.content}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-500 p-1 ml-2"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BrowserApp() {
  const [url, setUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const quickLinks = [
    { name: "Google", url: "https://www.google.com/search?igu=1" },
    { name: "Three.js", url: "https://rose.jessejesse.xyz/" },
    { name: "Paper.js", url: "https://clouds.jessejesse.com" },
    { name: "Next.js", url: "https://meta-mirror.vercel.app" },
    { name: "Emu.js", url: "https://retro.jessejesse.com" },
    { name: "Web3", url: "https://web3.jessejesse.com/" },
  ];

  const formatUrl = (inputUrl: string) => {
    if (!inputUrl) return "";
    if (!inputUrl.includes(".") || inputUrl.includes(" ")) {
      return `https://www.google.com/search?q=${encodeURIComponent(inputUrl)}`;
    }
    if (!inputUrl.startsWith("http://") && !inputUrl.startsWith("https://")) {
      return `https://${inputUrl}`;
    }
    return inputUrl;
  };

  const loadUrl = (targetUrl: string) => {
    const formattedUrl = formatUrl(targetUrl);
    if (!formattedUrl) return;

    setIsLoading(true);
    setCurrentUrl(formattedUrl);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(formattedUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setCanGoBack(newHistory.length > 1);
    setCanGoForward(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUrl(url);
  };

  const goBack = () => {
    if (canGoBack && historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setCanGoBack(newIndex > 0);
      setCanGoForward(true);
    }
  };

  const goForward = () => {
    if (canGoForward && historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setCanGoForward(newIndex < history.length - 1);
      setCanGoBack(true);
    }
  };

  const refresh = () => {
    if (currentUrl && iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = currentUrl;
    }
  };

  const goHome = () => {
    setCurrentUrl("");
    setIsLoading(false);
  };

  return (
    <div className="h-full bg-gray-200 flex flex-col">
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={goHome}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            title="Home"
          >
          🌐
          </button>
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className={cn(
              "p-2 rounded-full",
              canGoBack
                ? "bg-gray-100 hover:bg-gray-200"
                : "bg-gray-50 text-gray-400",
            )}
          >
            ←
          </button>
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className={cn(
              "p-2 rounded-full",
              canGoForward
                ? "bg-gray-100 hover:bg-gray-200"
                : "bg-gray-50 text-gray-400",
            )}
          >
            →
          </button>
          <button
            onClick={refresh}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
          🔄
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="search or enter website URL"
              className="w-full px-4 py-2 bg-gray-100 rounded-full border-none outline-none text-sm"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600"
          >
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
              <Globe className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                Random Web Browser
              </h2>
              <p className="text-center text-emerald-700 text-sm">¯\_(ツ)_/¯</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Java Frameworks
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setUrl(link.url);
                      loadUrl(link.url);
                    }}
                    className={cn(
                      "p-3 rounded-lg text-white text-sm font-semibold flex items-center justify-center transition-all hover:scale-[1.02]",
                      [
                        "bg-blue-600",
                        "bg-red-500",
                        "bg-gray-800",
                        "bg-purple-600",
                        "bg-green-600",
                        "bg-pink-600",
                      ][index % 6],
                    )}
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            </div>

         <div className="text-center text-xs text-emerald-400 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-2 shadow-sm">
  <p className="tracking-wide">React + Next.js + Tailwind + Redis + Vercel</p>
</div>


          </div>
        )}
      </div>
    </div>
  );
}

function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [operation, setOperation] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [resetDisplay, setResetDisplay] = useState(false);

  const handleNumberClick = (num: string) => {
    if (display === "0" || resetDisplay) {
      setDisplay(num);
      setResetDisplay(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperationClick = (op: string) => {
    setOperation(op);
    setPrevValue(Number.parseFloat(display));
    setResetDisplay(true);
  };

  const handleEqualsClick = () => {
    if (operation && prevValue !== null) {
      let result = 0;
      const currentValue = Number.parseFloat(display);

      switch (operation) {
        case "+":
          result = prevValue + currentValue;
          break;
        case "-":
          result = prevValue - currentValue;
          break;
        case "×":
          result = prevValue * currentValue;
          break;
        case "÷":
          result = prevValue / currentValue;
          break;
      }

      setDisplay(result.toString());
      setOperation(null);
      setPrevValue(null);
      setResetDisplay(true);
    }
  };

  const handleClearClick = () => {
    setDisplay("0");
    setOperation(null);
    setPrevValue(null);
    setResetDisplay(false);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <div className="h-16 flex items-end justify-end px-4 text-4xl font-light">
        {display}
      </div>

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
        <CalcButton
          onClick={() => handleOperationClick("÷")}
          className="bg-orange-500"
        >
          ÷
        </CalcButton>

        <CalcButton onClick={() => handleNumberClick("7")}>7</CalcButton>
        <CalcButton onClick={() => handleNumberClick("8")}>8</CalcButton>
        <CalcButton onClick={() => handleNumberClick("9")}>9</CalcButton>
        <CalcButton
          onClick={() => handleOperationClick("×")}
          className="bg-orange-500"
        >
          ×
        </CalcButton>

        <CalcButton onClick={() => handleNumberClick("4")}>4</CalcButton>
        <CalcButton onClick={() => handleNumberClick("5")}>5</CalcButton>
        <CalcButton onClick={() => handleNumberClick("6")}>6</CalcButton>
        <CalcButton
          onClick={() => handleOperationClick("-")}
          className="bg-orange-500"
        >
          -
        </CalcButton>

        <CalcButton onClick={() => handleNumberClick("1")}>1</CalcButton>
        <CalcButton onClick={() => handleNumberClick("2")}>2</CalcButton>
        <CalcButton onClick={() => handleNumberClick("3")}>3</CalcButton>
        <CalcButton
          onClick={() => handleOperationClick("+")}
          className="bg-orange-500"
        >
          +
        </CalcButton>

        <CalcButton
          onClick={() => handleNumberClick("0")}
          className="col-span-2"
        >
          0
        </CalcButton>
        <CalcButton onClick={() => handleNumberClick(".")}>.</CalcButton>
        <CalcButton onClick={handleEqualsClick} className="bg-orange-500">
          =
        </CalcButton>
      </div>
    </div>
  );
}

function CalcButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-9 rounded-full flex items-center justify-center bg-gray-800 font-medium",
        className,
      )}
    >
      {children}
    </button>
  );
}

function CalendarApp() {
  const [currentDate] = useState(new Date());
  const [events, setEvents] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());


  useEffect(() => {
    const loadEvents = async () => {
      try {
        const loadedEvents = (await redis.hgetall('calendar:events')) || {};
        setEvents(loadedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, []);


  const saveEvent = async (date: string, event: string) => {
    try {
      await redis.hset('calendar:events', { [date]: event });
      setEvents(prev => ({ ...prev, [date]: event }));
      return true;
    } catch (error) {
      console.error('Error saving event:', error);
      return false;
    }
  };

  const deleteEvent = async (date: string) => {
    try {
      await redis.hdel('calendar:events', date);
      const newEvents = { ...events };
      delete newEvents[date];
      setEvents(newEvents);
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  };

  
  const generateMonth = (month: number) => {
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
 
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

  
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasEvent = events[dateStr];
      
      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(dateStr)}
          className={`h-8 w-8 flex items-center justify-center rounded-full cursor-pointer text-sm
            ${hasEvent ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}
            ${selectedDate === dateStr ? 'ring-2 ring-blue-400' : ''}
            ${day === new Date().getDate() && month === new Date().getMonth() ? 'font-bold' : ''}`}
        >
          {day}
        </div>
      );
    }

    return (
      <div key={month} className="p-4 bg-gray-800 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {firstDay.toLocaleString('default', { month: 'long' })}
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-xs text-gray-400 pb-1">{day}</div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  // Event modal
  const EventModal = () => {
    if (!selectedDate) return null;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedDate && newEvent.trim()) {
        await saveEvent(selectedDate, newEvent.trim());
        setNewEvent('');
        setSelectedDate(null);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl mb-4">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </h3>
          
          {events[selectedDate] ? (
            <div className="mb-4">
              <p className="text-gray-300 mb-2">Event:</p>
              <p className="bg-gray-700 p-3 rounded">{events[selectedDate]}</p>
              <button
                onClick={() => deleteEvent(selectedDate)}
                className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              >
                Delete Event
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                placeholder="Enter event description"
                className="w-full bg-gray-700 text-white p-3 rounded mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded"
                  disabled={!newEvent.trim()}
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">
          {currentDate.getFullYear()}
        </h1>
        <button
          onClick={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
          className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
        >
          {viewMode === 'month' ? 'Show Year View' : 'Show Month View'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {viewMode === 'month' ? (
          generateMonth(currentMonth)
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => generateMonth(i))}
          </div>
        )}
      </div>

      {/* Events List Section */}
      <div className="mt-4 border-t border-gray-700 pt-4">
        <h2 className="text-lg font-medium mb-2">Upcoming Events</h2>
        {Object.entries(events).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(events)
              .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
              .map(([date, event]) => (
                <div key={date} className="bg-gray-800 p-3 rounded-lg">
                  <div className="text-blue-400 text-sm">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="mt-1">{event}</div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-400">No events scheduled</p>
        )}
      </div>

      <EventModal />
    </div>
  );
}

    
function Game() {
  const GRID_SIZE = 20
  const CANVAS_SIZE = 200 
  const INITIAL_SNAKE = [{ x: 5, y: 5 }]
  const INITIAL_FOOD = { x: 8, y: 8 }
  const INITIAL_DIRECTION = { x: 0, y: 0 }

  type Position = { x: number; y: number }
  type Direction = { x: number; y: number }

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>(INITIAL_FOOD)
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)


  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

  
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)


    ctx.strokeStyle = "rgba(0, 255, 255, 0.1)"
    ctx.lineWidth = 0.5
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, CANVAS_SIZE)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(CANVAS_SIZE, i)
      ctx.stroke()
    }


    snake.forEach((segment) => {
      ctx.fillStyle = "#00ff00"
      ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2)
    })

 
    ctx.fillStyle = "#ff0000"
    ctx.fillRect(food.x * GRID_SIZE + 1, food.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2)
  }, [snake, food])

 
  useEffect(() => {
    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] }
       
        if (head.x <= 2) direction.x = 1
        if (head.x >= 8) direction.x = -1
        if (head.y <= 2) direction.y = 1
        if (head.y >= 8) direction.y = -1
        
        head.x += direction.x
        head.y += direction.y
        
        const newSnake = [head, ...prevSnake.slice(0, 3)]
        
        return newSnake
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="w-full h-full"
    />
  )
}


function SnakeApp() {

  const GRID_SIZE = 20;
  const CANVAS_SIZE = 400;
  const INITIAL_SNAKE = [{ x: 10, y: 10 }];
  const INITIAL_FOOD = { x: 15, y: 15 };
  const INITIAL_DIRECTION = { x: 0, y: 0 };


  type Position = { x: number; y: number };
  type Direction = { x: number; y: number };
  type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number };


  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);


  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      };
    } while (snakeBody.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const createParticles = useCallback((x: number, y: number, count = 8) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: x * GRID_SIZE + GRID_SIZE / 2,
        y: y * GRID_SIZE + GRID_SIZE / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30,
        maxLife: 30,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  const checkCollision = useCallback((head: Position, snakeBody: Position[]): boolean => {
    if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
      return true;
    }
    return snakeBody.some((segment) => segment.x === head.x && segment.y === head.y);
  }, []);

  const moveSnake = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setSnake((currentSnake) => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      head.x += direction.x;
      head.y += direction.y;

      if (checkCollision(head, newSnake)) {
        setGameOver(true);
        setGameRunning(false);
        createParticles(head.x, head.y, 15);
        return currentSnake;
      }

      newSnake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => prev + 10);
        setFood(generateFood(newSnake));
        createParticles(food.x, food.y, 12);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameRunning, gameOver, checkCollision, generateFood, createParticles]);


  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!gameRunning) return;

    switch (e.key) {
      case "ArrowUp":
        if (direction.y === 0) setDirection({ x: 0, y: -1 });
        break;
      case "ArrowDown":
        if (direction.y === 0) setDirection({ x: 0, y: 1 });
        break;
      case "ArrowLeft":
        if (direction.x === 0) setDirection({ x: -1, y: 0 });
        break;
      case "ArrowRight":
        if (direction.x === 0) setDirection({ x: 1, y: 0 });
        break;
      case " ":
        e.preventDefault();
        setGameRunning(false);
        break;
    }
  }, [direction, gameRunning]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!gameRunning) return;
    e.preventDefault();
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  }, [gameRunning]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!gameRunning || !touchStartPos.current) return;
    e.preventDefault();
  }, [gameRunning]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartPos.current || !gameRunning) return;
    e.preventDefault();
    
    const touch = e.changedTouches[0];
    const endPos = { x: touch.clientX, y: touch.clientY };
    const startPos = touchStartPos.current;
    
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    

    if (Math.max(absDx, absDy) > 20) { 
      if (absDx > absDy) {
     
        if (dx > 0 && direction.x === 0) {
          setDirection({ x: 1, y: 0 }); // Right
        } else if (dx < 0 && direction.x === 0) {
          setDirection({ x: -1, y: 0 }); // Left
        }
      } else {
   
        if (dy > 0 && direction.y === 0) {
          setDirection({ x: 0, y: 1 }); // Down
        } else if (dy < 0 && direction.y === 0) {
          setDirection({ x: 0, y: -1 }); // Up
        }
      }
    }
    
    touchStartPos.current = null;
  }, [gameRunning, direction]);


  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection({ x: 1, y: 0 });
    setGameRunning(true);
    setGameOver(false);
    setScore(0);
    setParticles([]);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setGameRunning(false);
    setGameOver(false);
    setScore(0);
    setParticles([]);
  };

  const togglePause = () => {
    if (!gameOver) {
      setGameRunning(!gameRunning);
    }
  };


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;


    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameRunning) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [gameRunning]);

  useEffect(() => {
    const updateParticles = () => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1,
            vx: particle.vx * 0.98,
            vy: particle.vy * 0.98,
          }))
          .filter((particle) => particle.life > 0)
      );
    };

    const particleInterval = setInterval(updateParticles, 16);
    return () => clearInterval(particleInterval);
  }, []);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;


    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);


    ctx.strokeStyle = "rgba(0, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.shadowColor = "rgba(0, 255, 255, 0.5)";
    ctx.shadowBlur = 2;
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }


    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.shadowColor = isHead ? "rgba(0, 255, 0, 0.8)" : "rgba(0, 255, 0, 0.4)";
      ctx.shadowBlur = isHead ? 15 : 8;

      const gradient = ctx.createLinearGradient(
        segment.x * GRID_SIZE,
        segment.y * GRID_SIZE,
        segment.x * GRID_SIZE + GRID_SIZE,
        segment.y * GRID_SIZE + GRID_SIZE
      );

      if (isHead) {
        gradient.addColorStop(0, "#00ff00");
        gradient.addColorStop(1, "#00cc00");
      } else {
        gradient.addColorStop(0, "#00cc00");
        gradient.addColorStop(1, "#008800");
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(segment.x * GRID_SIZE + 2, segment.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    });


    const time = Date.now() * 0.005;
    const pulseIntensity = Math.sin(time) * 0.3 + 0.7;
    ctx.shadowColor = `rgba(255, 0, 0, ${pulseIntensity})`;
    ctx.shadowBlur = 20;

    const foodGradient = ctx.createRadialGradient(
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      0,
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2
    );
    foodGradient.addColorStop(0, "#ff0000");
    foodGradient.addColorStop(1, "#cc0000");

    ctx.fillStyle = foodGradient;
    ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);


    particles.forEach((particle) => {
      const alpha = particle.life / particle.maxLife;
      ctx.shadowColor = `rgba(0, 255, 255, ${alpha})`;
      ctx.shadowBlur = 5;
      ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
      ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2);
    });

    ctx.shadowBlur = 0;
  }, [snake, food, particles]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      <canvas
        ref={backgroundRef}
        className="absolute inset-0 opacity-30"
        style={{ width: "100vw", height: "100vh" }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md bg-black/80 border-cyan-500/30 backdrop-blur-sm shadow-2xl shadow-cyan-500/20 relative z-10 rounded-lg border">
        <div className="text-center border-b border-cyan-500/20 p-6">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            Quantum Snake
          </h3>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-cyan-400" style={{ textShadow: '0 0 10px currentColor' }}>Score: {score.toString().padStart(6, "0")}</span>
            <span className="text-purple-400" style={{ textShadow: '0 0 10px currentColor' }}>High: {highScore.toString().padStart(6, "0")}</span>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-6 p-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="border-2 border-cyan-500/50 rounded-lg shadow-lg shadow-cyan-500/30 bg-black/50 touch-none"
            />
            {!gameRunning && !gameOver && score === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                <div className="text-center">
                  <div className="text-cyan-400 text-xl font-bold mb-2 animate-pulse">Ready?</div>
                </div>
              </div>
            )}
            {!gameRunning && !gameOver && score > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                <div className="text-center">
                  <div className="text-yellow-400 text-xl font-bold mb-2 animate-pulse">Paused</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {!gameRunning && !gameOver && (
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-black font-bold px-6 py-2 rounded-lg shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105 hover:shadow-green-500/50"
              >
                {score === 0 ? "START GAME" : "RESUME"}
              </button>
            )}

            {gameRunning && (
              <button
                onClick={togglePause}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-6 py-2 rounded-lg shadow-lg shadow-yellow-500/30 transition-all duration-300 hover:scale-105"
              >
                Pause
              </button>
            )}

            {gameOver && (
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold px-6 py-2 rounded-lg shadow-lg shadow-red-500/30 transition-all duration-300 hover:scale-105 animate-pulse"
              >
                Try Again
              </button>
            )}

            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold px-6 py-2 rounded-lg shadow-lg shadow-gray-500/30 transition-all duration-300 hover:scale-105"
            >
              Start Over
            </button>
          </div>

          {gameOver && (
            <div className="text-center animate-bounce">
              <p className="text-red-400 font-bold text-xl mb-2" style={{ textShadow: '0 0 10px currentColor' }}>Fatal!</p>
              <p className="text-cyan-400 font-mono">Score: {score.toString().padStart(6, "0")}</p>
              {score === highScore && score > 0 && (
                <p className="text-yellow-400 font-bold text-sm mt-1 animate-pulse">High Score!</p>
              )}
            </div>
          )}

          <div className="text-center text-xs text-gray-400 space-y-1 font-mono border-t border-cyan-500/20 pt-4">
            <p className="text-cyan-300">Arrows • Swipe </p>
            <p className="text-cyan-300">Spacebar • Pause</p>
          </div>
        </div>
      </div>
    </div>
  );
}




      
