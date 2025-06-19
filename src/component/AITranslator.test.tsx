import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import AITranslator from "./AITranslator"; // Adjust path as necessary
import toast from "react-hot-toast";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock @google/generative-ai
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
}));
const mockGoogleGenerativeAI = vi.fn(() => ({
  getGenerativeModel: mockGetGenerativeModel,
}));
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: mockGoogleGenerativeAI,
}));

// Mock Zustand store useediter
vi.mock("./stores/EditerStore", () => ({
  useediter: vi.fn((selector) => {
    const state = {
      sourcevalue: "Hello world",
      targetvalue: "",
      setSourceValue: vi.fn(),
      setTargetValue: vi.fn(),
    };
    return selector(state);
  }),
}));

describe("AITranslator Component", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks(); // Clear all mocks including react-hot-toast and generative-ai
    // Resetting mock implementations if they were changed in a test
    mockGenerateContent.mockReset();
    mockGetGenerativeModel.mockImplementation(() => ({ // Re-assign with default mock
        generateContent: mockGenerateContent,
    }));
    mockGoogleGenerativeAI.mockImplementation(() => ({ // Re-assign with default mock
        getGenerativeModel: mockGetGenerativeModel,
    }));
    // Reset specific mock store values if necessary, though useediter mock is simple
    vi.mock("./stores/EditerStore", () => ({
      useediter: vi.fn((selector) => {
        const state = {
          sourcevalue: "Hello world", // Default test source value
          targetvalue: "",
          setSourceValue: vi.fn(),
          setTargetValue: vi.fn(),
        };
        return selector(state);
      }),
    }));
  });

  it("should render initial UI elements correctly", () => {
    render(<AITranslator />);
    expect(screen.getByText("AI翻訳ツール")).toBeInTheDocument();
    expect(screen.getByText("翻訳先言語")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument(); // Language select
    expect(
      screen.getByRole("button", { name: "翻訳実行" })
    ).toBeInTheDocument();
  });

  it("should show error toast if API key is missing on translate", async () => {
    localStorageMock.getItem.mockReturnValueOnce(null); // No API Key
    render(<AITranslator />);

    const translateButton = screen.getByRole("button", { name: "翻訳実行" });
    fireEvent.click(translateButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Gemini APIキーが設定されていません。設定メニューから登録してください。"
      );
    });
    expect(mockGoogleGenerativeAI).not.toHaveBeenCalled();
  });

  it("should call Gemini API with correct parameters and update result on success", async () => {
    localStorageMock.setItem("geminiApiKey", "fake-api-key");
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve("こんにちは世界"),
      },
    });

    render(<AITranslator />);

    const languageSelect = screen.getByRole("combobox");
    fireEvent.change(languageSelect, { target: { value: "ja" } }); // Change to Japanese

    const translateButton = screen.getByRole("button", { name: "翻訳実行" });
    fireEvent.click(translateButton);

    expect(screen.getByRole("button", { name: /翻訳中.../i })).toBeInTheDocument(); // Loading state

    await waitFor(() => {
      expect(mockGoogleGenerativeAI).toHaveBeenCalledWith("fake-api-key");
      expect(mockGetGenerativeModel).toHaveBeenCalledWith({ model: "gemini-pro" });
      expect(mockGenerateContent).toHaveBeenCalledWith(
        "Translate the following text to ja: Hello world"
      );
    });

    await waitFor(() => {
      expect(screen.getByText("こんにちは世界")).toBeInTheDocument(); // Display result
    });
    expect(toast.success).toHaveBeenCalledWith("翻訳が完了しました！");
    expect(screen.getByRole("button", { name: "翻訳実行" })).toBeInTheDocument(); // Back to normal state
  });

  it("should show error toast if Gemini API call fails", async () => {
    localStorageMock.setItem("geminiApiKey", "fake-api-key");
    mockGenerateContent.mockRejectedValueOnce(new Error("API Error"));

    render(<AITranslator />);

    const translateButton = screen.getByRole("button", { name: "翻訳実行" });
    fireEvent.click(translateButton);

    expect(screen.getByRole("button", { name: /翻訳中.../i })).toBeInTheDocument(); // Loading state

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "翻訳中にエラーが発生しました。"
      );
    });
    expect(screen.queryByText("こんにちは世界")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "翻訳実行" })).toBeInTheDocument(); // Back to normal state
  });

  it("should manage isLoading state correctly during API call", async () => {
    localStorageMock.setItem("geminiApiKey", "fake-api-key");
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => Promise.resolve("Translated Text"),
      },
    });

    render(<AITranslator />);
    const translateButton = screen.getByRole("button", { name: "翻訳実行" });

    // Check initial state
    expect(translateButton).not.toBeDisabled();
    expect(translateButton.textContent).toBe("翻訳実行");

    // Click to translate
    fireEvent.click(translateButton);

    // Check loading state
    expect(translateButton).toBeDisabled();
    expect(translateButton.textContent).toBe("翻訳中...");
    await waitFor(() => expect(toast.success).toHaveBeenCalled()); // Wait for API call to finish

    // Check final state
    expect(translateButton).not.toBeDisabled();
    expect(translateButton.textContent).toBe("翻訳実行");
  });

   it("should show error if source text is empty", async () => {
    // Mock useediter to return empty sourceValue
    vi.mock("./stores/EditerStore", () => ({
      useediter: vi.fn((selector) => {
        const state = {
          sourcevalue: " ", // Empty or whitespace
          targetvalue: "",
          setSourceValue: vi.fn(),
          setTargetValue: vi.fn(),
        };
        return selector(state);
      }),
    }));

    render(<AITranslator />);
    const translateButton = screen.getByRole("button", { name: "翻訳実行" });
    fireEvent.click(translateButton);

    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("翻訳する原文がありません");
    });
    expect(mockGoogleGenerativeAI).not.toHaveBeenCalled();
  });

  it("should clear previous translation results before a new translation", async () => {
    localStorageMock.setItem("geminiApiKey", "fake-api-key");
    // First translation
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => Promise.resolve("First Translation") },
    });

    render(<AITranslator />);
    const translateButton = screen.getByRole("button", { name: "翻訳実行" });
    fireEvent.click(translateButton);

    await waitFor(() => {
      expect(screen.getByText("First Translation")).toBeInTheDocument();
    });

    // Second translation
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => Promise.resolve("Second Translation") },
    });
    // Mock useediter to return a different sourceValue for the second call if needed
    vi.mock("./stores/EditerStore", () => ({
        useediter: vi.fn((selector) => {
          const state = {
            sourcevalue: "Another text",
            targetvalue: "",
            setSourceValue: vi.fn(),
            setTargetValue: vi.fn(),
          };
          return selector(state);
        }),
      }));

    render(<AITranslator />); // Re-render or ensure state updates allow this
    fireEvent.click(screen.getByRole("button", { name: "翻訳実行" }));


    await waitFor(() => {
      // Previous result should be gone before new one appears, or immediately after clicking.
      // Testing this precisely depends on implementation detail (e.g., if result is cleared sync or async)
      // For this component, it's cleared synchronously before the async call.
      expect(screen.queryByText("First Translation")).not.toBeInTheDocument();
    });

    await waitFor(() => {
        expect(screen.getByText("Second Translation")).toBeInTheDocument();
    });
  });
});
