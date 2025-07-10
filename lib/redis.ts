import { Redis } from "@upstash/redis";

// Initialize Redis client with the provided credentials
export const redis = new Redis({
  url: "https://crack-hen-56730.upstash.io",
  token: "Ad2aAAIjcDFmMzYzNWIzYmNjMjM0Yjg4OGJhM2M4Yjc4N2FlZmFmOHAxMA",
});

// Helper functions for contact management
export async function getContacts() {
  try {
    const contacts = (await redis.hgetall("contacts")) || {};
    return Object.entries(contacts).map(([name, phone]) => ({
      name,
      phone: phone as string,
    }));
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
}

export async function addContact(name: string, phone: string) {
  try {
    await redis.hset("contacts", { [name]: phone });
    return true;
  } catch (error) {
    console.error("Error adding contact:", error);
    return false;
  }
}

export async function deleteContact(name: string) {
  try {
    await redis.hdel("contacts", name);
    return true;
  } catch (error) {
    console.error("Error deleting contact:", error);
    return false;
  }
}

// Calendar event helpers
export async function saveEvent(date: string, event: string) {
  try {
    await redis.hset("calendar:events", { [date]: event });
    return true;
  } catch (error) {
    console.error("Error saving event:", error);
    return false;
  }
}

export async function getEvents(): Promise<Record<string, string>> {
  try {
    return (await redis.hgetall("calendar:events")) || {};
  } catch (error) {
    console.error("Error fetching events:", error);
    return {};
  }
}
