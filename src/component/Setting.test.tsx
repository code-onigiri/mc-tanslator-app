import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import SettingsMenu from "./Setting"; // Adjust path as necessary

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock window.matchMedia, used by the theme toggle
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock alert, used in the component for API key save confirmation
global.alert = vi.fn();

describe("SettingsMenu Component", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks(); // Clear all mocks before each test
  });

  it("should render the settings button", () => {
    render(<SettingsMenu />);
    const settingsButton = screen.getByRole("button", {
      name: /設定メニューを開く/i,
    });
    expect(settingsButton).toBeInTheDocument();
  });

  it("should open the menu when settings button is clicked", () => {
    render(<SettingsMenu />);
    const settingsButton = screen.getByRole("button", {
      name: /設定メニューを開く/i,
    });
    fireEvent.click(settingsButton);
    expect(screen.getByText("Gemini API Key")).toBeInTheDocument();
    expect(screen.getByText("ダークモード")).toBeInTheDocument();
  });

  it("should load Gemini API key from localStorage on mount and display it", async () => {
    localStorageMock.setItem("geminiApiKey", "test-api-key-123");
    render(<SettingsMenu />);

    const settingsButton = screen.getByRole("button", {
      name: /設定メニューを開く/i,
    });
    fireEvent.click(settingsButton);

    // The input is of type 'password', so value is not directly visible
    // We check if the input element has the value
    const apiKeyInput = (await screen.findByPlaceholderText(
      "Enter your API Key"
    )) as HTMLInputElement;
    expect(apiKeyInput.value).toBe("test-api-key-123");
  });

  it("should save Gemini API key to localStorage when 'Save API Key' button is clicked", async () => {
    render(<SettingsMenu />);
    const settingsButton = screen.getByRole("button", {
      name: /設定メニューを開く/i,
    });
    fireEvent.click(settingsButton);

    const apiKeyInput = await screen.findByPlaceholderText(
      "Enter your API Key"
    );
    fireEvent.change(apiKeyInput, { target: { value: "new-api-key-456" } });

    const saveButton = screen.getByRole("button", { name: /Save API Key/i });
    fireEvent.click(saveButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "geminiApiKey",
      "new-api-key-456"
    );
    expect(global.alert).toHaveBeenCalledWith("API Key saved!");
  });

  it("should update input field value when typing", async () => {
    render(<SettingsMenu />);
    const settingsButton = screen.getByRole("button", {
      name: /設定メニューを開く/i,
    });
    fireEvent.click(settingsButton);

    const apiKeyInput = (await screen.findByPlaceholderText(
      "Enter your API Key"
    )) as HTMLInputElement;
    fireEvent.change(apiKeyInput, { target: { value: "typing-api-key" } });
    expect(apiKeyInput.value).toBe("typing-api-key");
  });

  // Test for theme toggle to ensure existing functionality isn't broken
  it("should toggle dark mode", async () => {
    render(<SettingsMenu />);
    const settingsButton = screen.getByRole("button", {
      name: /設定メニューを開く/i,
    });
    fireEvent.click(settingsButton);

    const darkModeToggle = screen.getByRole("checkbox"); // Assuming the toggle is a checkbox
    const initialTheme = localStorageMock.getItem("theme");

    fireEvent.click(darkModeToggle);
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "theme",
        initialTheme === "dark" ? "light" : "dark"
      );
    });

    fireEvent.click(darkModeToggle);
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "theme",
        initialTheme === "dark" ? "dark" : "light" // Toggled back
      );
    });
  });
});
